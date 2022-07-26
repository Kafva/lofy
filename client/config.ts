const DEBUG = true

class Config {
  static readonly serverUrl = "http://127.0.0.1:20111"

  static readonly volumeStep = 0.05;
  static readonly defaultVolume = 1.0;

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
const exctractFromTemplate = (selector: string): HTMLLIElement[] =>
  Array.from(document.querySelectorAll(`#${selector} > li`))

const MEDIA_LISTS = Object.freeze({
  [MediaListType.LocalPlaylist]: exctractFromTemplate("_playlists"),
  [MediaListType.LocalAlbum]:    exctractFromTemplate("_albums"),
  [MediaListType.YouTube]:       exctractFromTemplate("_yt-playlists"),
})

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

export {MEDIA_LISTS, LIST_TYPES, MEDIA_TITLES, MediaListType, Log, Err}
export default Config;

