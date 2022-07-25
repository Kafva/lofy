package server

import (
	"bufio"
	"html/template"
	"net/http"
	"os"
	"path/filepath"
	"regexp"
	"sort"
	"strconv"
	"strings"
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
        Playlists: get_local_playlists(PLAYLIST_DIR),
        Albums: get_albums(ALBUM_DIR),
				YtPlaylists: get_yt_playlists(),
      }
      tmpl.Execute(w, data)
    } else {
      next.ServeHTTP(w, r)
    }
  })
}

// The endpoint accepts requests with an album id
//		GET /audio/<album>/<album id>
// the album_id is translated into a corresponding filename
// and passed on to a `FileServer` handler for the response
func TranslateIndexToFilename(next http.Handler) http.Handler {
	return http.HandlerFunc( func(w http.ResponseWriter, r *http.Request) {
		//== Parameter validation ==//
		album, idx, _ :=
			strings.Cut(strings.TrimPrefix(r.URL.Path, "/audio/"), "/")

		album_regex 	   := regexp.MustCompile(ALBUM_NAME_REGEX)
		album_index,err  := strconv.Atoi(idx)

		if err != nil {
			return;  // Non-numeric album id
		}
		if !album_regex.Match([]byte(album)) {
			return; // Invalid album name
		}

		filename :=
			album_id_to_filename(album_index, TranslateTilde(ALBUM_DIR+"/"+album))

		// Update the request path and forward the request to the `FileServer`
		r.URL.Path = album+"/"+filename
		w.Header().Set("Access-Control-Allow-Origin", "*")
		next.ServeHTTP(w, r)
	})
}

// Return a list of all playlists defined in `YT_PLAYLIST_FILE`
func get_yt_playlists() []YtPlaylist  {
	playlists := make([]YtPlaylist,0,YT_MAX_PLAYLIST_CNT)
	f, err := os.Open(TranslateTilde(YT_PLAYLIST_FILE))
	if err == nil {
		defer f.Close()
		scanner := bufio.NewScanner(f)

		line:=1
		for scanner.Scan() {
			split := strings.Split(scanner.Text(), ";")
			if len(split)!=2 {
				Die("Invalid format of '"+YT_PLAYLIST_FILE+"', line "+strconv.Itoa(line))
			}
			playlists = append(playlists, YtPlaylist{
				DisplayName: strings.TrimSpace(split[0]),
				Id: strings.TrimSpace(split[1]),
			})
			line++
		}
	} else {
		Die("Failed to locate '" + YT_PLAYLIST_FILE+"'")
	}

	return playlists
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
func get_local_playlists(path string) []string {
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
