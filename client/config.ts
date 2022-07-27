import { PlaylistEntry } from './types';

const DEBUG = true

class Config {
  static readonly serverUrl = "http://127.0.0.1:20111"

  static readonly volumeStep = 0.05;
  static readonly defaultVolume = 0.0;

  static readonly seekStepSec = 5;

  // Keyboard shortcuts
  static readonly pausePlayKey = ' ';

  // With <Shift> modifier
  static readonly previousTrackKey = 'ArrowLeft';
  static readonly nextTrackKey = 'ArrowRight';
  static readonly volumeDownKey = 'ArrowDown';
  static readonly volumeUpKey = 'ArrowUp';
  static readonly seekBackKey = 'H';
  static readonly seekForwardKey = 'L';
  static readonly shuffleKey = 'S';
  static readonly coverKey = 'F';
}

enum MediaListType {
  LocalPlaylist, LocalAlbum, YouTube
}

// Creating this array programmatically is not necessary
const LIST_TYPES = Object.freeze([
  MediaListType.LocalPlaylist,
  MediaListType.LocalAlbum,
  MediaListType.YouTube
])

/**
* Note: each of the <ul> lists that we want to render
* already exist in the DOM when we recieve `index.html` from the server.
* We extract these values into ararys ONCE and not for every `render()`
*/
const extractListsFromTemplate = (selector: string): HTMLLIElement[] =>
  Array.from(document.querySelectorAll(`#${selector} > li`))

const MEDIA_LISTS = Object.freeze({
  [MediaListType.LocalPlaylist]: extractListsFromTemplate("_playlists"),
  [MediaListType.LocalAlbum]:    extractListsFromTemplate("_albums"),
  [MediaListType.YouTube]:       extractListsFromTemplate("_yt-playlists"),
})

const extractPlaylistOrderFromTemplate = (): Map<string,PlaylistEntry[]> => {
  const order = new Map<string,PlaylistEntry[]>()

  MEDIA_LISTS[MediaListType.LocalPlaylist].map(p=>p.innerHTML)
    .forEach( (pls:string) => {
      // The order of items in the `items` array corresponds to the
      // order of the m3u playlist
      const items = document.querySelectorAll(`ul[data-name='${pls}'] > li`)

      order.set(pls, <PlaylistEntry[]>[])

      for (const li of items) {
        const split = li.innerHTML.split(":")
        order.get(pls)!.push({
          AlbumFS: split[0] as string,
          AlbumId: parseInt(split[1] as string)
        } as PlaylistEntry)
      }
    })
  return order
}

/**
* Contains a mapping on the form { playlist_name: [ PlaylistEntry ] }
* Each `PlaylistEntry` array is sorted in the same order as the m3u
* file on disk.
*/
const PLAYLIST_ORDER = extractPlaylistOrderFromTemplate()

const MEDIA_TITLES = Object.freeze({
  [MediaListType.LocalPlaylist]:"Playlists",
  [MediaListType.LocalAlbum]:   "Albums",
  [MediaListType.YouTube]:      "YouTube"
})

const Log = (...args: any) => {
  if (DEBUG) {
    console.log("%c DEBUG ", 'background: #2b71e0; color: #f5e4f3', ...args)
  }
}
const Err = (...args: any) => {
  console.log("%c ERROR ", 'background: #ed493e; color: #f5e4f3', ...args)
}
const Warn = (...args: any) => {
  console.log("%c WARN ", 'background: #dbba00; color: #ffffff', ...args)
}

export {
  MEDIA_LISTS, LIST_TYPES, MEDIA_TITLES, PLAYLIST_ORDER,
  MediaListType, Log, Err, Warn
}
export default Config;

