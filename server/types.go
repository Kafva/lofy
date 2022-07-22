package server

// The fields need to be capitalised (public) to be part
// of the serialised output of `json.Encode()`
type TrackInfo struct {
  Title string
  Album string
  Artist string
  AlbumArtist string
  Duration int
  ArtworkUrl string 
}

func NewTrackInfo() TrackInfo {
  return TrackInfo {
    Title: "",
    Album: "",
    Artist: "",
    AlbumArtist: "",
    Duration: 0,
    ArtworkUrl: "", 
  }
}
