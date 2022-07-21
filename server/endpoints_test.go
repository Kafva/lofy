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
	if reflect.DeepEqual(album_names, []string{"1","2"}) {
		t.Errorf("get_albums() failed")
	}
}

