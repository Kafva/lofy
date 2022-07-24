interface Track {
  Title: string
  Artist: string
  Album: string
  Duration: number
}

interface LocalTrack extends Track {
  AlbumFS: string
	AlbumId: number
}

interface YtTrack extends Track {
	AudioUrl: string
	ArtworkUrl: string
}

export type { Track, LocalTrack, YtTrack }
