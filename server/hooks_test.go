package server

import (
	"reflect"
	"testing"
)

func Test_get_albums(t *testing.T){
  album_names := get_albums("../.tests")
  if !reflect.DeepEqual(album_names, []string{"1","2"}) {
    t.Errorf("get_albums() failed")
  }
}
func Test_get_local_playlists(t *testing.T){
  playlist_names := get_local_playlists("../.tests/1")
  if !reflect.DeepEqual(playlist_names, []string{"a","b"}) {
    t.Errorf("get_local_playlists() failed")
  }
}
