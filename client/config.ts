import { MediaListType } from './types';
import { 
  ExtractListsFromTemplate, ExtractPlaylistOrderFromTemplate 
} from './util';

const DEBUG = true

class Config {
  static readonly serverUrl = "http://127.0.0.1:20111"

  static readonly shuffleDefaultOn = true;
  static readonly volumeStep = 0.05;
  static readonly defaultVolume = 0.0;
  static readonly seekStepSec = 5;
  
  // Only applicable for YouTube videos >= 30 min
  static readonly sameTrackSkipMin = 30;
  static readonly sameTrackSeekStepMin = 3;

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

  // Internals
  static readonly activeListKey = "activeList"
  static readonly listIndexKey  = "listIndex"
}

/**
* A stack of indices representing previously played tracks
* in the current list by index
* Pushed to during: 
*  <audio> 'onended' event
*  'nexttrack' event
*  click on another entry
* Popped from during:
*  'previoustrack' event
* Reset when a new list is picked in <App>
* Having this as a global is kind of not good...
*/
const TRACK_HISTORY: number[] = []

/** Creating this array programmatically is not necessary */
const LIST_TYPES = Object.freeze([
  MediaListType.LocalPlaylist,
  MediaListType.LocalAlbum,
  MediaListType.YouTube
])


/**
* Note: each of the <ol> lists that we want to render
* already exist in the DOM when we recieve `index.html` from the server.
* We extract these values into ararys ONCE and not for every `render()`
*/
const MEDIA_LISTS = Object.freeze({
  [MediaListType.LocalPlaylist]: ExtractListsFromTemplate("_playlists"),
  [MediaListType.LocalAlbum]:    ExtractListsFromTemplate("_albums"),
  [MediaListType.YouTube]:       ExtractListsFromTemplate("_yt-playlists"),
})


/**
* Contains a mapping on the form { playlist_name: [ PlaylistEntry ] }
* Each `PlaylistEntry` array is sorted in the same order as the m3u
* file on disk.
*/
const PLAYLIST_ORDER = ExtractPlaylistOrderFromTemplate()

const MEDIA_TITLE_CLASSES = Object.freeze({
  [MediaListType.LocalPlaylist]:"nf nf-mdi-playlist_play",
  [MediaListType.LocalAlbum]:   "nf nf-mdi-album",
  [MediaListType.YouTube]:      "nf nf-mdi-youtube_play"
})


export {
  MEDIA_LISTS, LIST_TYPES, PLAYLIST_ORDER, TRACK_HISTORY, DEBUG,
  MEDIA_TITLE_CLASSES
}
export default Config;

