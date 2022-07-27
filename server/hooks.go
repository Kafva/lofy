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

		line:=0
		for scanner.Scan() {
			line++
			text := scanner.Text()
			if len(text) == 0 { continue } // Allow empty lines

			split := strings.Split(text, ";")
			if len(split)!=2 {
				Die("Invalid format of '"+YT_PLAYLIST_FILE+"', line "+strconv.Itoa(line))
			}
			playlists = append(playlists, YtPlaylist{
				DisplayName: strings.TrimSpace(split[0]),
				Id: strings.TrimSpace(split[1]),
			})
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

// Return a `LocalPlaylist` object for each .m3u file under `PLAYLIST_DIR`
func get_local_playlists(path string) []LocalPlaylist {
  local_playlists := make([]LocalPlaylist, 0, MAX_PLAYLIST_CNT)
	ordered_paths := make([]string, MAX_TRACKS, MAX_TRACKS)
	playlist_dir := TranslateTilde(path)

  if playlists, err := os.ReadDir(playlist_dir); err==nil {
    for _,playlist := range playlists {
      if !playlist.IsDir() &&
			 strings.HasSuffix(playlist.Name(),"."+PLAYLIST_EXT) {
				playlist_path := playlist_dir+"/"+playlist.Name()
				track_paths := make([]string, 0, MAX_TRACKS)

				if ! get_track_paths_from_playlist(playlist_path, &track_paths) {
					Die("Failed to open '"+playlist_path+"'")
				}

				// Save an ordered list of the tracks in the playlist
				for i,track_path:= range track_paths {
					ordered_paths[i] = track_path
				}
				album_id_map := get_album_id_map(track_paths)

				local_playlist := LocalPlaylist {
					Name: strings.TrimSuffix(playlist.Name(), "."+PLAYLIST_EXT),
					Sources: []string{},
				}

				// Set the <AlbumFS:AlbumId> source for each entry in the ordered list
				for i := range track_paths {
					album_name := filepath.Base(filepath.Dir(ordered_paths[i]))
					local_playlist.Sources = append(local_playlist.Sources,
						 album_name+":"+strconv.Itoa(album_id_map[ordered_paths[i]]),
					)
				}

				local_playlists = append(local_playlists, local_playlist)
      }
    }
  }
  return local_playlists
}
