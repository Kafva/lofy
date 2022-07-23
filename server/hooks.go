package server

import (
	"html/template"
	"net/http"
	"os"
	"os/exec"
	"path/filepath"
	"sort"
	"strconv"
	"strings"

	"github.com/tidwall/gjson"
)

// Return 404 for any request that ends on a '/'
// An exception is made for `/app` which will result
// in a redirect to index.html instead of a 404
func DisableDirListings(next http.Handler) http.Handler {
  return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
    if strings.HasSuffix(r.URL.Path, "/") {
			if strings.HasPrefix(r.URL.Path, "/app") {
				http.Redirect(w, r, "/app/index.html", 301)
			} else {
				http.NotFound(w, r)
			}
      return
    }
    next.ServeHTTP(w, r)
  })
}

// Instead of fetching the list of playlists and albums after loading index.html
// we use a template to include these resources automatically on every request
func TemplateHook(next http.Handler) http.Handler {
  return http.HandlerFunc( func(w http.ResponseWriter, r *http.Request) {
    if filepath.Base(r.URL.Path) == "index.html" {
			// We need to use the version of `index.html` under `dist` that 
			// has paths resolved by Vite
			var tmpl = template.Must(template.ParseFiles(WEBROOT_DIR+"/index.html"))

      data := TemplateData {
        Playlists: get_playlists(PLAYLIST_DIR),
        Albums: get_albums(ALBUM_DIR),
      }
      tmpl.Execute(w, data)
    } else {
      next.ServeHTTP(w, r)
    }
  })
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

// Returns a sorted list of all non-hidden .m3u files beneath the provided path
// with the .m3u suffix removed.
func get_playlists(path string) []string {
  playlist_names := make([]string, 0, MAX_PLAYLIST_CNT)
  if playlists, err := os.ReadDir(TranslateTilde(path)); err==nil {
    for _,playlist := range playlists {
      if !playlist.IsDir() && 
			 strings.HasSuffix(playlist.Name(),"."+PLAYLIST_EXT) {
        playlist_names = append(playlist_names, 
					strings.TrimSuffix(playlist.Name(), "."+PLAYLIST_EXT),
				)
      }
    }
  }
  sort.Strings(playlist_names)
  return playlist_names
}

// https://www.youtube.com/watch?list=PLeO-rHNGADqzCkDOyEUZbJMnuu5s9yIGh
// Fetches a list of all YtTrack objects for a playlist
// The `AudioUrl` field will be empty and needs to be requested separately
func fetch_yt_playlist(playlist_id string) []YtTrack {
    cmd     := exec.Command(
      YTDL_BIN, "-j", "--format", "bestaudio", 
      "--flat-playlist", "--skip-download",
      "https://www.youtube.com/watch?list="+playlist_id,
    )
    out,err   := cmd.Output()
		if err == nil {
			// The JSON output lacks an outer array
			out_str := "["+string(out)+"]"

			length := gjson.Get(out_str, "#").Int()
			yt_tracks := make([]YtTrack,0,length)

			for i:=0; i < int(length); i++ {
				idx := strconv.Itoa(i)
				yt_tracks = append(yt_tracks, YtTrack{
					Track: Track {
						Title: 		gjson.Get(out_str, idx+".title").String(),
						Artist: 	gjson.Get(out_str, idx+".uploader").String(),
						Album: 		gjson.Get(out_str, idx+".playlist").String(),
						Duration: int(gjson.Get(out_str, idx+".duration").Int()),
					},
					ArtworkUrl: gjson.Get(out_str, idx+".thumbnails.2.url").String(),
					AudioUrl: "",
				})
			}
			return yt_tracks
		}
		return []YtTrack{}
}


