package server

import (
	"strings"
	"testing"

	ffmpeg "github.com/u2takey/ffmpeg-go"
)

func Test_fetch_yt_url(t *testing.T) {
  if !strings.HasPrefix(fetch_yt_url("hpF-WS0lU5A"), "https://") {
    t.Errorf("Failed to retrieve YouTube URL for video ID")
  }
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
	data,_:= ffmpeg.Probe("../.mocks/2/track.m4a")
	index,codec := get_cover_stream(data)

  if index != 1 || codec != "png" {
    t.Errorf("get_cover_stream() failed")
  }
}

