package server

import (
	"encoding/json"
	"net/http"
	"os"
	"os/exec"
	"regexp"
	"sort"
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
  // Input validation
  var input_regex = regexp.MustCompile(ALLOWED_GET_PARAM)

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

// Fetch metadata about a track, for local files:
//    ?v=playlist/<name>
//    ?v=album/<name>
// For YouTube:
//    ?v=yt/<video id>
// Returns an empty array on failure
// Track artwork is fetched from a different endpoint
func GetMetadata(w http.ResponseWriter, r *http.Request){
  w.Header().Set("Access-Control-Allow-Origin", "*")
  w.Header().Set("Content-Type", "application/json")
  tracks := make([]TrackInfo, 0, MAX_TRACKS)

  endpoint, name, _ := 
    strings.Cut(strings.TrimPrefix(r.URL.Path, "/meta/"), "/")

  switch endpoint {
    case "playlist":
    case "album":
      album_path := TranslateTilde(ALBUM_DIR)+"/"+name 
      if files, err := os.ReadDir(album_path); err==nil {
        for _,file := range files {
          if !file.IsDir() {
            track_info,err := get_file_metadata(
              album_path+"/"+file.Name(),
            )
            if err == nil {
              tracks = append(tracks, track_info)
            }
          }
        }
      }
    case "yt":
  }
  json.NewEncoder(w).Encode(tracks)
}

// Create a `TrackInfo` struct for the given file
// TODO: go-routine
func get_file_metadata(path string) (TrackInfo,error) {
  data, err := ffmpeg.Probe(path)
  if err == nil {
    track_info := TrackInfo {
      Title:          gjson.Get(data, "format.tags.title").String(),
      Album:          gjson.Get(data, "format.tags.album").String(),
      Artist:         gjson.Get(data, "format.tags.artist").String(),
      AlbumArtist:    gjson.Get(data, "format.tags.album_artist").String(),
      Duration:       int(gjson.Get(data, "format.duration").Float()),
      ArtworkUrl: "",
    }
    return track_info,nil
  }
  return NewTrackInfo(),err
}

func GetArtwork(w http.ResponseWriter, r *http.Request){
}


