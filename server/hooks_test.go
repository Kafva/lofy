package server

import (
	"reflect"
	"testing"
)

func Test_get_albums(t *testing.T){
  album_names := get_albums("../.mocks")
  if !reflect.DeepEqual(album_names, []string{"1","2"}) {
    t.Errorf("get_albums() failed")
  }
}
func Test_get_playlists(t *testing.T){
  playlist_names := get_playlists("../.mocks/1")
  if !reflect.DeepEqual(playlist_names, []string{"a","b"}) {
    t.Errorf("get_playlists() failed")
  }
}

