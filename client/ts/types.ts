enum SourceType {
  LocalPlaylist = 0, LocalAlbum = 1, YouTube = 2
}

// Names of keys in localStorage
enum LocalStorageKeys {
  activeSource = "activeSource",
  listIndex  = "listIndex",
  visualiser  = "visualiser",
  volume = "volume"
}

interface SourceShortcut {
  key: string
  sourceType: SourceType
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
    PlaylistEntry, Track, LocalTrack, YtTrack, ActiveTuple, SourceShortcut
}
export { EmptyTrack, SourceType, LocalStorageKeys }
