package server

import (
	"encoding/json"
	"net/http"
	"os"
	"os/exec"
	"regexp"
	"sort"
	"strings"
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

		// Load the response into an arbitrary interface{}
		jsonMap := make(map[string](interface{}))
		err     := json.Unmarshal(out, &jsonMap)

		if err == nil {
			// The Json parser will always replace url-encoded strings like %2C 
			// and we therefore respond with plaintext on this endpoint
			if url, ok := jsonMap["url"].(string); ok {
				return url
			}
		}
		return ""
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
//		?v=playlist/<name>/<track name>
//		?v=album/<name>/<track name>
// For YouTube:
//		?v=yt/<video id>
func GetTrackMetadata(w http.ResponseWriter, r *http.Request){
}

func GetErr(w http.ResponseWriter, r *http.Request){
  w.Header().Set("Access-Control-Allow-Origin", "*")
  w.Header().Set("Content-Type", "application/json")

	res := map[string]string{"err": "JSON error"}

	// Respond with a JSON message
	json.NewEncoder(w).Encode(res)
}

