import { SourceType } from './types';
import {
  ExtractListsFromTemplate, ExtractPlaylistOrderFromTemplate
} from './util';

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

/**
* Note: each of the <ol> lists that we want to render
* already exist in the DOM when we recieve `index.html` from the server.
* We extract these values into ararys ONCE and not for every `render()`
*/
const SOURCE_LISTS = Object.freeze({
  [SourceType.LocalPlaylist]: ExtractListsFromTemplate("_playlists"),
  [SourceType.LocalAlbum]:    ExtractListsFromTemplate("_albums"),
  [SourceType.YouTube]:       ExtractListsFromTemplate("_yt-playlists"),
})

/**
* To avoid interruptions when transitioning to a new YouTube video,
* the next url is prefetched by a webworker. Prefetching more than
* one URL would most likely be a bed idea since the URL derived by
* `yt-dlp` is only valid for a limited time. This will likely cause
* bugs in playlists with very long videos.
*
* The `import.meta.url` argument is needed to create the name
* of the compiled version of `worker.ts` in the output.
*/
const WORKER = new Worker(new URL('./worker.ts', import.meta.url))

/**
* Contains a mapping on the form { playlist_name: [ PlaylistEntry ] }
* Each `PlaylistEntry` array is sorted in the same order as the m3u
* file on disk.
*/
const PLAYLIST_ORDER = ExtractPlaylistOrderFromTemplate()

const SOURCE_TITLE_CLASSES = Object.freeze({
  [SourceType.LocalPlaylist]:"nf nf-mdi-playlist_play",
  [SourceType.LocalAlbum]:   "nf nf-mdi-album",
  [SourceType.YouTube]:      "nf nf-mdi-youtube_play"
})


export {
  SOURCE_LISTS, PLAYLIST_ORDER, TRACK_HISTORY,
  SOURCE_TITLE_CLASSES, WORKER
}

