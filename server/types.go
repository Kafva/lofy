package server

import (
	"os/exec"

	gjson "github.com/tidwall/gjson"
)

type TemplateData struct {
	Albums []string
	Playlists []string
}

// Fields need to be capitalised (public) for them to appear in
// the serialised output of `json.Encode()`
type Track struct {
  Title string
  Artist string
  Album string
  Duration int
}

type LocalTrack struct {
	Track
	// The `AlbumFS` field corresponds to the actual directory name
	// on disk. This information is needed by the client to create requests
	// The album set in the metadata of a file is maintained separately
  AlbumFS string
	// The index of the particular track on the filesystem
	// this ID is passed to the server when requesting album artwork
	AlbumId int
}

type YtTrack struct {
	Track
	// The data url which can be placed in the `src` of
	// and <audio> element
	AudioUrl string
	ArtworkUrl string
}

func (y *YtTrack) FetchYtUrl(video_id string) {
    cmd     := exec.Command(
      YTDL_BIN, "-j", "--format", "bestaudio", 
      "--extract-audio", "--skip-download",
      "https://www.youtube.com/watch?v="+video_id,
    )
    out,_   := cmd.Output()

		y.AudioUrl = gjson.Get(string(out), "url").String() 
}

func NewTrack() Track {
  return Track {
    Title: "",
    Album: "",
    Artist: "",
    Duration: 0,
  }
}

func NewLocalTrack() LocalTrack {
	return LocalTrack {
		Track: NewTrack(),
		AlbumFS: "",
		AlbumId: 0,
	}
}

func NewYtTrack() YtTrack {
	return YtTrack {
		Track: NewTrack(),
		AudioUrl: "",
		ArtworkUrl: "",
	}
}

