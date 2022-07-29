enum MediaListType {
  LocalPlaylist = 0, LocalAlbum = 1, YouTube = 2
}

interface ActiveTuple {
  activeList: MediaListType,
  listIndex: number,
  mediaName: string
}

interface PlaylistEntry {
  AlbumFS: string
  AlbumId: number
}

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
  TrackId: string
	AudioUrl: string
	ArtworkUrl: string
}

const EmptyTrack = (): Track =>  { 
  return { Title: "", Artist: "", Album: "", Duration: 0 } as Track; 
}

export type { PlaylistEntry, Track, LocalTrack, YtTrack, ActiveTuple }
export { EmptyTrack, MediaListType }
