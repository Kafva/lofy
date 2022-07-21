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
// Returns a sorted list of all non-hidden directories beneath
// the provided path.
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
// If `mode=yt` is given, returns youtube playlists
func GetPlaylists(w http.ResponseWriter, r *http.Request){
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

