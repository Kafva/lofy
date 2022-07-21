package server

type TrackInfo struct {
  title string
  album string
  artist string
  albumArtist string
  duration int
  artworkUrl string 
}

func NewTrackInfo() TrackInfo {
  return TrackInfo {
    title: "",
    album: "",
    artist: "",
    albumArtist: "",
    duration: 0,
    artworkUrl: "", 
  }
}
