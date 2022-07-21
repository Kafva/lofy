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

  // Music referenced in a playlist must be within an album
  audio_root := http.FileServer(http.Dir(TranslateTilde(ALBUM_DIR)))
  http.Handle("/audio/", http.StripPrefix("/audio", audio_root))

  // API endpoints
  http.HandleFunc("/url", GetUrl)
  http.HandleFunc("/playlists", GetPlaylists)
  http.HandleFunc("/albums", GetAlbums)
  http.HandleFunc("/err", GetErr)
  http.ListenAndServe(ADDR+":"+strconv.Itoa(PORT), nil)
}

func redirect_to_app(w http.ResponseWriter, r *http.Request) {
    http.Redirect(w, r, "/app", 301)
}

