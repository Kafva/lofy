const DEBUG = true

class Config {
  static readonly serverProto = "http"
  static readonly serverIp = "127.0.0.1";
  static readonly serverPort = 20111;
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
    console.log(...args)
  }
}

export {MEDIA_LISTS, LIST_TYPES, MEDIA_TITLES, MediaListType, Log}
export default Config;

