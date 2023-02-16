package main

import (
    "encoding/json"
    "flag"
    "io/ioutil"
    "log"
    "net/http"
    "strconv"

    . "github.com/Kafva/lofy/server"
)

func main() {
    var config = ""
    flag.StringVar(&config, "c", "", "Path to a JSON configuration file")
    flag.Parse()
    if config != "" {
        f, err := ioutil.ReadFile(config)
        if err != nil {
            Die(err)
        }
        err = json.Unmarshal(f, &CONFIG)
        if err != nil {
            Die(err)
        }

        CONFIG.YTDL_BIN = TranslateTilde(CONFIG.YTDL_BIN)
        CONFIG.FFMPEG_BIN = TranslateTilde(CONFIG.FFMPEG_BIN)
        CONFIG.FFPROBE_BIN = TranslateTilde(CONFIG.FFPROBE_BIN)
        CONFIG.ALBUM_DIR = TranslateTilde(CONFIG.ALBUM_DIR)
        CONFIG.PLAYLIST_DIR = TranslateTilde(CONFIG.PLAYLIST_DIR)
        CONFIG.YT_PLAYLIST_FILE = TranslateTilde(CONFIG.YT_PLAYLIST_FILE)
        CONFIG.TLS_CERT = TranslateTilde(CONFIG.TLS_CERT)
        CONFIG.TLS_KEY = TranslateTilde(CONFIG.TLS_KEY)
    }

    log.SetFlags(log.Ltime)
    Debugf("CONFIG { %+v }\n", CONFIG)

    // Web app resources are mounted at `/app`
    // The entrypoint is `/app/index.html`
    web_root := http.FileServer(http.Dir(WEBROOT_DIR))
    http.Handle("/app/",
        http.StripPrefix("/app", TemplateHook(DisableDirListings(web_root))))
    http.HandleFunc("/", redirect_to_app)

    audio_root := http.FileServer(http.Dir(TranslateTilde(CONFIG.ALBUM_DIR)))
    http.Handle("/audio/",
        TranslateIndexToFilename(DisableDirListings(audio_root)))

    // Endpoints with a trailing slash accept subpaths
    http.HandleFunc("/yturl/", GetYtUrl)
    http.HandleFunc("/yt/", GetYtPlaylist)

    // Local files
    http.HandleFunc("/meta/", GetLocalMetadata)
    http.HandleFunc("/art/", GetArtwork)

    serverLocation := CONFIG.ADDR + ":" + strconv.Itoa(CONFIG.PORT)

    if CONFIG.USE_TLS {
        Info("Listening on 'https://" + serverLocation + "'...")
        err := http.ListenAndServeTLS(serverLocation,
            CONFIG.TLS_CERT,
            CONFIG.TLS_KEY, nil,
        )
        if err != nil {
            Die("ListenAndServeTLS", err)
        }
    } else {
        Info("Listening on 'http://" + serverLocation + "'...")
        http.ListenAndServe(serverLocation, nil)
    }
}

func redirect_to_app(w http.ResponseWriter, r *http.Request) {
    if r.URL.Path == "/" {
        http.Redirect(w, r, "/app/index.html", 301)
    }
}
