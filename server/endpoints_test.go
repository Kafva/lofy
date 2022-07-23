package server

import (
	"strings"
	"testing"
)

func Test_fetch_yt_url(t *testing.T) {
  if !strings.HasPrefix(fetch_yt_url("hpF-WS0lU5A"), "https://") {
    t.Errorf("Failed to retrieve YouTube URL for video ID")
  }

	// https://www.youtube.com/watch?v=OTZzjAU0Kg0&list=PLeO-rHNGADqzCkDOyEUZbJMnuu5s9yIGh
	fetch_yt_url("PLeO-rHNGADqzCkDOyEUZbJMnuu5s9yIGh")
}

func Test_get_file_metadata(t *testing.T){
  c := make(chan TrackInfo, 1)
  //go get_file_metadata("/Users/jonas/Music/JB/01 Mark My Words.m4a", c)
  go get_file_metadata("../.mocks/2/track.m4a", 0, c)
  track_info := <- c

  if track_info.Title != 
    "You are in a field" {
    t.Errorf("get_file_metadata() failed")
  }
}

func Test_get_cover_stream(t *testing.T){
	data,_:= ffprobe("../.mocks/2/track.m4a")
	index,codec_name := get_cover_stream(string(data))

  if index != 1 || codec_name != "png" {
    t.Errorf("get_cover_stream() failed")
  }
}
