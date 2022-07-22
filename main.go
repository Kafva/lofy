package main

import (
	"net/http"
	"strconv"

	. "github.com/Kafva/lofy/server"
)


func main(){
  // Web app resources are mounted at `/app` and accessible directly from `/`
  web_root := http.FileServer(http.Dir(WEBROOT_DIR))
  http.Handle("/app/", 
    http.StripPrefix("/app", TemplateHook(DisableDirListings(web_root)),
  ))
  http.HandleFunc("/", redirect_to_app)

  audio_root := http.FileServer(http.Dir(TranslateTilde(ALBUM_DIR)))
  http.Handle("/audio/", 
    http.StripPrefix("/audio", DisableDirListings(audio_root),
  ))

  // Endpoints with a trailing slash accept subpaths
  http.HandleFunc("/yturl", GetYtUrl)
  http.HandleFunc("/art/", GetArtwork)
  http.HandleFunc("/meta/", GetMetadata)

  Debug("Listening on port "+strconv.Itoa(PORT)+"...")
  http.ListenAndServe(ADDR+":"+strconv.Itoa(PORT), nil)
}

func redirect_to_app(w http.ResponseWriter, r *http.Request) {
    if r.URL.Path == "/" || r.URL.Path == "/app" {
      http.Redirect(w, r, "/app/index.html", 301)
    }
}

