package main

import (
	"net/http"
	"strconv"

	"github.com/gorilla/websocket"
	. "github.com/Kafva/lofy/server"
)

var upgrader = websocket.Upgrader{}

func main(){
  // Web app resources are mounted at `/app` and accessible directly from `/`
  web_root := http.FileServer(http.Dir(WEBROOT_DIR))
  http.Handle("/app/", http.StripPrefix("/app", web_root))
  http.HandleFunc("/", redirect_to_app)

  audio_root := http.FileServer(http.Dir(TranslateTilde(ALBUM_DIR)))
  http.Handle("/audio/", http.StripPrefix("/audio", audio_root))

  // HTTP API endpoints
  http.HandleFunc("/playlists", GetPlaylists)
  http.HandleFunc("/albums", GetAlbums)

	// TODO: WebSocket communication
  http.HandleFunc("/meta/", GetMetadata)
  http.HandleFunc("/url", GetUrl)


	http.HandleFunc("/ws",  ws)


	Debug("Listening on port "+strconv.Itoa(PORT)+"...")
  http.ListenAndServe(ADDR+":"+strconv.Itoa(PORT), nil)
}


func ws(w http.ResponseWriter, r *http.Request) {
    // Upgrade the connection to the WebSocket protocol
    conn, err := upgrader.Upgrade(w, r, nil)
    if err != nil {
        Warn("Failed to upgrade connection for "+r.RemoteAddr)
        return
    }
    defer conn.Close()

    for {
      err = conn.WriteMessage(websocket.PingMessage, []byte("🔰"))
      if err != nil {
        Err(err)
        break
      }
    }
}

func redirect_to_app(w http.ResponseWriter, r *http.Request) {
    if r.URL.Path == "/" {
      http.Redirect(w, r, "/app", 301)
    }
}

