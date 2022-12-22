package main

import (
    "encoding/json"
    "flag"
    "io/ioutil"
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
    }

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
