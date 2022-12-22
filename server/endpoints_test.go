package server

import (
    "strings"
    "testing"
)

func Test_fetch_yt_url(t *testing.T) {
    yt_track := NewYtTrack()
    yt_track.FetchYtUrl("hpF-WS0lU5A")
    if !strings.HasPrefix(yt_track.AudioUrl, "https://") {
        t.Errorf("Failed to retrieve YouTube URL for video ID")
    }
}

func Test_fetch_yt_playlist(t *testing.T) {
    pls := fetch_yt_playlist("PLeO-rHNGADqzCkDOyEUZbJMnuu5s9yIGh", false)
    if len(pls) != 21 || pls[0].Title != "Intro" {
        t.Errorf("fetch_yt_playlists() failed")
    }
}

func Test_get_file_metadata(t *testing.T) {
    c := make(chan LocalTrack, 1)
    //go get_file_metadata("/Users/jonas/Music/JB/01 Mark My Words.m4a", 0, c)
    go get_file_metadata("../server/.tests/2/track.m4a", 0, c)
    track_info := <-c

    if track_info.Title !=
        "You are in a field" {
        t.Errorf("get_file_metadata() failed")
    }
}

func Test_get_cover_stream(t *testing.T) {
    data, _ := ffprobe("../server/.tests/2/track.m4a")
    index, codec_name := get_cover_stream(string(data))

    if index != 1 || codec_name != "png" {
        t.Errorf("get_cover_stream() failed")
    }
}
