package server

import (
	"bufio"
	"encoding/json"
	"net/http"
	"os"
	"os/exec"
	"path/filepath"
	"regexp"
	"sort"
	"strconv"
	"strings"

	gjson "github.com/tidwall/gjson"
	ffmpeg "github.com/u2takey/ffmpeg-go"
)

// Fetch the media streaming URL for a given YouTube video
// The video ID should be passed in `?v`
// If no video was found or a server side error occurred
// an empty response is returned.
func GetUrl(w http.ResponseWriter, r *http.Request){
  w.Header().Set("Access-Control-Allow-Origin", "*")
  w.Header().Set("Content-Type", "text/plain")
  //== Input validation ==//
  input_regex := regexp.MustCompile(ALLOWED_STRS)

  if video := r.URL.Query().Get("v"); input_regex.MatchString(video) {
    Debug("Fetching YouTube URL for: "+video)
    w.Write( []byte(fetch_yt_url(video)) )

  } else {
    Warn("Invalid YouTube video ID requested by " + r.RemoteAddr )
    w.Write([]byte(""))
  }
}
func fetch_yt_url(video string) string {
    cmd     := exec.Command(
      YTDL_BIN, "-j", "--format", "bestaudio", 
      "--extract-audio", "--skip-download",
      "https://www.youtube.com/watch?v="+video,
    )
    out,_   := cmd.Output()

    return gjson.Get(string(out), "url").String()
}

// Fetch a list of all albums, returns a JSON array (empty on failure)
// Not applicable for YouTube
func GetAlbums(w http.ResponseWriter, r *http.Request){
  w.Header().Set("Access-Control-Allow-Origin", "*")
  w.Header().Set("Content-Type", "application/json")
  json.NewEncoder(w).Encode(get_albums(ALBUM_DIR))
}
// Returns a sorted list of all non-hidden directories beneath `path`.
func get_albums(path string) []string {
  album_names := make([]string, 0, MAX_ALBUM_CNT)
  if albums, err := os.ReadDir(TranslateTilde(path)); err==nil {
    for _,album := range albums {
      if album.IsDir() && !strings.HasPrefix(album.Name(),".") {
        album_names = append(album_names, album.Name())
      }
    }
  }
  sort.Strings(album_names)
  return album_names
}

// Fetch a list of all playlists, returns a JSON array (empty on failure)
// If `mode=yt` is given, returns YouTube playlists
func GetPlaylists(w http.ResponseWriter, r *http.Request){
  w.Header().Set("Access-Control-Allow-Origin", "*")
  w.Header().Set("Content-Type", "application/json")

  switch mode := r.URL.Query().Get("mode"); mode {
    case "yt":
      json.NewEncoder(w).Encode([]string{})
    default:
      json.NewEncoder(w).Encode(get_playlists(PLAYLIST_DIR))
  }
}

// Returns a sorted list of all non-hidden .m3u files beneath the provided path.
func get_playlists(path string) []string {
  playlist_names := make([]string, 0, MAX_PLAYLIST_CNT)
  if playlists, err := os.ReadDir(TranslateTilde(path)); err==nil {
    for _,playlist := range playlists {
      if !playlist.IsDir() && strings.HasSuffix(playlist.Name(),".m3u") {
        playlist_names = append(playlist_names, playlist.Name())
      }
    }
  }
  sort.Strings(playlist_names)
  return playlist_names
}

// Fetch metadata about a track 
// For local files:
//    ?v=playlist/<name>
//    ?v=album/<name>
// For YouTube:
//    ?v=yt/<video id>
// Returns an empty array on failure
// Track artwork is fetched from a different endpoint
//
// Extracting metadata about a track takes ~0.03 seconds
// A playlist should easily be able to handle 300-1000 tracks
// so this process needs to be parallelised
//
// Even with parallelism, it could take to long for a response to be
// sent from the server so we use paging for each `ITEMS_PER_REQ`
// set of entries, returning incremental results
//    GET /meta/album/Purpose        -> { info:[], page: 1, last_page: false }
//    GET /meta/album/Purpose?page=2 -> { info:[], page: 2, last_page: false }
//    GET /meta/album/Purpose?page=3 -> { info:[], page: 3, last_page: true  }
//
func GetMetadata(w http.ResponseWriter, r *http.Request){
  //==================== Parameter validation ================================//
  endpoint, name, _ := 
    strings.Cut(strings.TrimPrefix(r.URL.Path, "/meta/"), "/")

  input_regex := regexp.MustCompile(ALLOWED_STRS)

	if !input_regex.Match([]byte(endpoint)) || !input_regex.Match([]byte(name)) {
		return; // Invalid subcommand or resource name
	}
	
  page := 1
  if page_param := r.URL.Query().Get("page"); page_param != "" {
    if page_as_int, err := strconv.Atoi(page_param); err == nil {
      page = page_as_int
    } else {
      return; // Non-numeric input
    }
  }
	//==========================================================================//

  w.Header().Set("Access-Control-Allow-Origin", "*")
  w.Header().Set("Content-Type", "application/json")

	track_paths := make([]string, 0, MAX_TRACKS)
	
	// Populate the `track_paths` slice with data based on the given subcommand
  switch endpoint {
    case "playlist":
			f, err := os.Open(TranslateTilde(PLAYLIST_DIR)+"/"+name+"."+PLAYLIST_EXT)
			if err == nil {
				defer f.Close()
				scanner := bufio.NewScanner(f)

				for scanner.Scan() {
					track_paths = append(track_paths, scanner.Text())
				}
			} else {
				Warn("Non-existent playlist requested by " + r.RemoteAddr)
				return
			}
    case "album":
      album_path := TranslateTilde(ALBUM_DIR)+"/"+name 

      if entries, err := os.ReadDir(album_path); err==nil {
				// Create a list of all files under the specified album
				for _,f := range FsFilter(entries, false) {
					track_paths = append(track_paths, album_path+"/"+f.Name())
				} 
      } else {
				Warn("Non-existent album requested by " + r.RemoteAddr)
				return
			}
    case "yt":
  }

	// Extract the files relevant for the given page index
	if len(track_paths) >= page*ITEMS_PER_REQ {
		track_paths = track_paths[ (page-1)*ITEMS_PER_REQ : page*ITEMS_PER_REQ ]
	} else if len(track_paths) >= (page-1)*ITEMS_PER_REQ {
		track_paths = track_paths[ (page-1)*ITEMS_PER_REQ :  ]
	} else {
			return; // Invalid page
	}

	// Reading on the `tracks_channel` will be blocked until
	// `len(track_paths)` entries have become available
	tracks_channel := make(chan TrackInfo, len(track_paths))
	tracks         := make([]TrackInfo, len(track_paths), len(track_paths))

	for _,p := range track_paths {
		go get_file_metadata(p, tracks_channel)
	}

	// Consume the data on the channel
	for i:=0; i< len(track_paths); i++ {
		tracks[i] = <- tracks_channel
	}

	json.NewEncoder(w).Encode(tracks)
}

// Create a `TrackInfo` struct for the given file
// and send it back to the caller over the `c` channel
func get_file_metadata(path string, c chan TrackInfo) {
  data, err := ffmpeg.Probe(path)
  if err == nil {
    c <- TrackInfo {
      Title:          gjson.Get(data, "format.tags.title").String(),
      Artist:         gjson.Get(data, "format.tags.artist").String(),
      AlbumMeta:      gjson.Get(data, "format.tags.album").String(),
			Album:          filepath.Base(filepath.Dir(path)),
      Duration:       int(gjson.Get(data, "format.duration").Float()),
      ArtworkUrl: "",
    }
  } else {
    c <- NewTrackInfo()
  }
}

func GetArtwork(w http.ResponseWriter, r *http.Request){
}


