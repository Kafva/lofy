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
)

// Fetch the media streaming URL for a given YouTube video
// The video ID should be passed in `?v`
// If no video was found or a server side error occurred
// an empty response is returned.
func GetYtUrl(w http.ResponseWriter, r *http.Request){
  w.Header().Set("Access-Control-Allow-Origin", "*")
  //== Input validation ==//
  input_regex := regexp.MustCompile(ALLOWED_STRS)

  if video := r.URL.Query().Get("v"); input_regex.MatchString(video) {
    Debug("Fetching YouTube URL for: "+video)
		yt_track := NewYtTrack()
		yt_track.FetchYtUrl(video)

		w.Header().Set("Content-Type", "text/plain")
    w.Write([]byte(yt_track.AudioUrl))

  } else {
    Warn("Invalid YouTube video ID requested by " + r.RemoteAddr )
    w.Write([]byte(""))
  }
}

// Fetch an array of the `YtTrack` objects for a given playlist
// since yt-dlp does not return paged resutlts, we only need to perform one
// request
// GET   /yt/<playlist id>
func GetYtPlaylist(w http.ResponseWriter, r *http.Request) {
	input_regex := regexp.MustCompile(ALLOWED_STRS)
  playlist_id := filepath.Base(r.URL.Path)
	if input_regex.Match([]byte(playlist_id)) {

		yt_tracks := fetch_yt_playlist(playlist_id)

    w.Header().Set("Access-Control-Allow-Origin", "*") 
		w.Header().Set("Content-Type", "application/json")

		res := map[string]interface{} { "tracks": yt_tracks }
		json.NewEncoder(w).Encode(res)
	}
}

// https://www.youtube.com/watch?list=PLeO-rHNGADqzCkDOyEUZbJMnuu5s9yIGh
// Fetches a list of all YtTrack objects for a playlist
// The `AudioUrl` field will be empty and needs to be requested separately
func fetch_yt_playlist(playlist_id string) []YtTrack {
    cmd     := exec.Command(
      YTDL_BIN, "-j", "--format", "bestaudio",
      "--flat-playlist", "--skip-download",
      "https://www.youtube.com/watch?list="+playlist_id,
    )
    out,err   := cmd.Output()
		if err == nil {
			// The JSON output lacks an outer array
			out_str := "["+string(out)+"]"

			length := gjson.Get(out_str, "#").Int()
			yt_tracks := make([]YtTrack,0,length)

			for i:=0; i < int(length); i++ {
				idx := strconv.Itoa(i)
				yt_tracks = append(yt_tracks, YtTrack{
					Track: Track {
						Title: 		gjson.Get(out_str, idx+".title").String(),
						Artist: 	gjson.Get(out_str, idx+".uploader").String(),
						Album: 		gjson.Get(out_str, idx+".playlist").String(),
						Duration: int(gjson.Get(out_str, idx+".duration").Int()),
					},
					ArtworkUrl: gjson.Get(out_str, idx+".thumbnails.2.url").String(),
					AudioUrl: "",
				})
			}
			return yt_tracks
		}
		return []YtTrack{}
}

// Fetch metadata about a track
// For local files:
//    /meta/playlist/<name>
//    /meta/album/<name>
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
//    GET /meta/album/<name>        -> { tracks:[], last_page: false }
//    GET /meta/album/<name>?page=2 -> { tracks:[], last_page: false }
//    GET /meta/album/<name>?page=3 -> { tracks:[], last_page: true  }
//
func GetLocalMetadata(w http.ResponseWriter, r *http.Request){
  //== Parameter validation ==//
  endpoint, name, _ :=
    strings.Cut(strings.TrimPrefix(r.URL.Path, "/meta/"), "/")

  endpoint_regex := regexp.MustCompile(ALLOWED_STRS)
	name_regex 	   := regexp.MustCompile(ALBUM_NAME_REGEX)

	if !endpoint_regex.Match([]byte(endpoint)) || !name_regex.Match([]byte(name)) {
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
					line := strings.TrimSpace(scanner.Text())
					if !strings.HasPrefix("#", line) {
						// Skip '#' lines in a playlist
						track_paths = append(track_paths, line)
					}
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
		default:
			json.NewEncoder(w).Encode([]string{})
			return
  }

	// Extract the files relevant for the given page index
	last_page := false
	if len(track_paths) >= page*ITEMS_PER_REQ {
		track_paths = track_paths[ (page-1)*ITEMS_PER_REQ : page*ITEMS_PER_REQ ]
	} else if len(track_paths) >= (page-1)*ITEMS_PER_REQ {
		last_page = true
		track_paths = track_paths[ (page-1)*ITEMS_PER_REQ :  ]
	} else {
			return; // Invalid page
	}

	// Reading on the `tracks_channel` will be blocked until
	// `len(track_paths)` entries have become available
	tracks_channel := make(chan LocalTrack, len(track_paths))
	tracks         := make([]LocalTrack, len(track_paths), len(track_paths))

	// To ensure that we send a canonical album ID, sort the track paths
	sort.Strings(track_paths)

	for i,p := range track_paths {
		go get_file_metadata(p, i, tracks_channel)
	}

	// Consume the data on the channel
	for i:=0; i< len(track_paths); i++ {
		tracks[i] = <- tracks_channel
	}

	res := map[string]interface{} {
		"tracks": tracks, "last_page": last_page,
	}
	json.NewEncoder(w).Encode(res)
}

// Determine if the file has a stream with an image (cover art)
// Accepts `ffprobe` JSON as input and returns the stream index and codec name.
func get_cover_stream(data string) (int,string) {
	stream_cnt  := gjson.Get(data, "streams.#").Int()
	for s:=0; s<int(stream_cnt); s++ {
		codec_name := gjson.Get(data, "streams."+strconv.Itoa(s)+".codec_name").String()
		if idx := Contains(COVER_CODECS[:], codec_name); idx != -1 {
			return s, codec_name
		}
	}
	return -1,""
}

func ffprobe(path string) ([]byte,error) {
		return exec.Command(FFPROBE_BIN, "-v", "quiet", "-print_format",
			"json", "-show_format", "-show_streams", path,
		).Output()
}

// Create a `Track` struct for the given file
// and send it back to the caller over the `c` channel
func get_file_metadata(path string, id int, c chan LocalTrack) {
	data,err := ffprobe(path)

  if err == nil {
		data_str := string(data)
    c <- LocalTrack {
			Track: Track {
				Title:    gjson.Get(data_str, "format.tags.title").String(),
				Artist:   gjson.Get(data_str, "format.tags.artist").String(),
				Album:    gjson.Get(data_str, "format.tags.album").String(),
				Duration: int(gjson.Get(data_str, "format.duration").Float()),
			},
			AlbumFS: filepath.Base(filepath.Dir(path)),
			AlbumId: id,
    }
  } else {
    c <- NewLocalTrack()
  }
}

// Translate an album ID into a filename, the translation assumes
// that the filepaths under an album are sorted
func album_id_to_filename(album_id int, path string) string {
	if entries, err := os.ReadDir(path); err==nil {
		if files := FsFilter(entries, false); album_id < len(files) {

			// Sort by filename
			sort.Slice(files, func(i,j int) bool {
					return files[i].Name() < files[j].Name()
			})
			return files[album_id].Name()
		}
	}
	return ""
}

//    GET /art/<album>/<album_id>   -> <data>
func GetArtwork(w http.ResponseWriter, r *http.Request){
  album, album_id_str, _ :=
    strings.Cut(strings.TrimPrefix(r.URL.Path, "/art/"), "/")

	//== Parameter validation ==//
	album_id,err := strconv.Atoi(album_id_str)
	if err != nil {
		return  // Non-numeric album id
	}
	if !regexp.MustCompile(ALBUM_NAME_REGEX).Match([]byte(album)) {
		return; // Invalid album name
	}

	// Translate the album ID to a filename
	album_path := TranslateTilde(ALBUM_DIR)+"/"+album
	track_path := album_path+"/"+album_id_to_filename(album_id, album_path)

	if track_path != "" {
		data,err := ffprobe(track_path)
		if err == nil {
			stream_id,codec_name := get_cover_stream(string(data))

			// Set the content type based on the image format
			if codec_name == "mjpeg" {
				codec_name = "jpeg"
			}

			// Extract the image stream and pipe it to the HTTP response
			cover,err := exec.Command(FFMPEG_BIN, "-i", track_path, "-map",
				"0:"+strconv.Itoa(stream_id), "-f", "image2", "-vcodec", "copy",
				"-vframes", "1", "pipe:",
			).Output()

			if err != nil {
				Err(err)
			} else {
				w.Header().Set("Content-Type","image/"+codec_name)
				w.Write(cover)
			}
		}
	}
}


