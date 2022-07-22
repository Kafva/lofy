package server

// The fields need to be capitalised (public) to be part
// of the serialised output of `json.Encode()`
type TrackInfo struct {
  Title string
	// The `Album` field must correspond to the actual directory name
	// on disk for the client to properly request media.
	// The album set in the metadata of a file is therefore maintained separately
  Album string
  Artist string
  AlbumMeta string
  Duration int
  ArtworkUrl string 
}

func NewTrackInfo() TrackInfo {
  return TrackInfo {
    Title: "",
    Album: "",
    Artist: "",
    AlbumMeta: "",
    Duration: 0,
    ArtworkUrl: "", 
  }
}
