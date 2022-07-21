package main

import (
	"encoding/json"
	"net/http"
	"os/exec"
	"strconv"
)

const PORT = 20111
const ADDR = "127.0.0.1"

// Fetch the media streaming URL for a given YouTube video
// The video ID should be passed in `?v`
// If no video was found or a server side error occurred
// an empty response is returned.
func get_url(w http.ResponseWriter, r *http.Request){
  w.Header().Set("Access-Control-Allow-Origin", "*")
  w.Header().Set("Content-Type", "application/json")

	if video := r.URL.Query().Get("v"); video != "" {
		cmd     := exec.Command(
			"yt-dlp", "-j", "--format", "bestaudio", 
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
				w.Write([]byte(url))
				return
			}
		}
	}

	w.Write([]byte(""))
}

func get_err(w http.ResponseWriter, r *http.Request){
  w.Header().Set("Access-Control-Allow-Origin", "*")
  w.Header().Set("Content-Type", "application/json")

	res := map[string]string{"err": "JSON error"}

	// Respond with a JSON message
	json.NewEncoder(w).Encode(res)
}

// Fetch a list of all playlists, returns a JSON array (empty on failure)
// If `mode=yt` is given, returns youtube playlists
func get_playlists(w http.ResponseWriter, r *http.Request){
}

// Fetch metadata about a track, for local files:
//		?v=playlist/<name>/<track name>
//		?v=album/<name>/<track name>
// For YouTube:
//		?v=yt/<video id>
func get_track_metadata(w http.ResponseWriter, r *http.Request){
}

func main(){
  fs := http.FileServer(http.Dir("./dist/"))
  http.Handle("/", fs)

  http.HandleFunc("/url", get_url)
  http.HandleFunc("/err", get_err)
  http.ListenAndServe(ADDR+":"+strconv.Itoa(PORT), nil)
}

