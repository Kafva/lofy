enum SourceType {
  LocalPlaylist = 0, LocalAlbum = 1, YouTube = 2
}

interface WorkerMessage {
  currentTrackId: string
  nextPredictedTrackId: string
}

interface Shortcut {
  key: string
  activeSource: SourceType
  listIndex: number
}

interface ActiveTuple {
  activeSource: SourceType
  listIndex: number
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

export type { 
  PlaylistEntry, Track, LocalTrack, YtTrack, ActiveTuple, Shortcut,
  WorkerMessage
}
export { EmptyTrack, SourceType }
