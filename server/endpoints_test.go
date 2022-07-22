package server

import (
	"reflect"
	"strings"
	"testing"
)

func Test_fetch_yt_url(t *testing.T) {
  if !strings.HasPrefix(fetch_yt_url("hpF-WS0lU5A"), "https://") {
    t.Errorf("Failed to retrieve YouTube URL for video ID")
  }
}
func Test_get_albums(t *testing.T){
  album_names := get_albums("../.mocks")
  if !reflect.DeepEqual(album_names, []string{"1","2"}) {
    t.Errorf("get_albums() failed")
  }
}
func Test_get_playlists(t *testing.T){
  playlist_names := get_playlists("../.mocks/1")
  if !reflect.DeepEqual(playlist_names, []string{"a.m3u","b.m3u"}) {
    t.Errorf("get_playlists() failed")
  }
}

func Test_get_file_metadata(t *testing.T){
  c := make(chan TrackInfo, 1)
  go get_file_metadata("../.mocks/2/track.m4a", c)
  track_info := <- c

  if track_info.Title != 
    "You are in a field" {
    t.Errorf("get_file_metadata() failed")
  }
}


