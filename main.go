package main

import (
	"net/http"
	"strconv"

	. "github.com/Kafva/lofy/server"
)

func main(){
  // Web app resources are mounted at `/app` and accessible directly from `/`
  web_root := http.FileServer(http.Dir(WEBROOT_DIR))
  http.Handle("/app/", http.StripPrefix("/app", web_root))
  http.HandleFunc("/", redirect_to_app)

  audio_root := http.FileServer(http.Dir(TranslateTilde(ALBUM_DIR)))
  http.Handle("/audio/", http.StripPrefix("/audio", audio_root))

  // Non-paginated API endpoints
  http.HandleFunc("/playlists", GetPlaylists)
  http.HandleFunc("/albums", GetAlbums)
  http.HandleFunc("/url", GetUrl)

  // Paginated API endpoints
  http.HandleFunc("/meta/", GetMetadata)

	Debug("Listening on port "+strconv.Itoa(PORT)+"...")
  http.ListenAndServe(ADDR+":"+strconv.Itoa(PORT), nil)
}

func redirect_to_app(w http.ResponseWriter, r *http.Request) {
    if r.URL.Path == "/" {
      http.Redirect(w, r, "/app", 301)
    }
}

