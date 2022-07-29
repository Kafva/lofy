import { MediaListType, LocalTrack, YtTrack, Track, ActiveTuple, PlaylistEntry } from './types';
import Config, { MEDIA_LISTS, TRACK_HISTORY, PLAYLIST_ORDER } from './config';
import { Err, Log } from './util';

/**
* Sort an array of `LocalTrack` objects such that they are in the
* order indicated by a `PlaylistEntry` array from `PLAYLIST_ORDER`
*/
const sortPlaylist = (unsorted: LocalTrack[], playlist_name: string) => {
  unsorted.sort( (a:LocalTrack,b:LocalTrack) => {
    const pl_index_a = PLAYLIST_ORDER.get(playlist_name)!.findIndex(
      (e:PlaylistEntry) => e.AlbumFS==a.AlbumFS && e.AlbumId == a.AlbumId
    )
    const pl_index_b = PLAYLIST_ORDER.get(playlist_name)!.findIndex((e:PlaylistEntry) =>
      e.AlbumFS==b.AlbumFS && e.AlbumId == b.AlbumId
    )
    return pl_index_a - pl_index_b
  })
}

const initFetchCache = (mediaList: MediaListType): Map<string,[Track[],boolean]> => {
  let mediaListNames: string[] = [];
  if (mediaList == MediaListType.YouTube) {
    mediaListNames =
      MEDIA_LISTS[mediaList].map( (el:HTMLLIElement) =>
        el.getAttribute("data-id")!.toString())
  } else {
    mediaListNames =
      MEDIA_LISTS[mediaList].map( (el:HTMLLIElement) =>
        el.innerHTML!.toString() )
  }

  const nameMapping = new Map<string, [Track[],boolean]>()
  mediaListNames.forEach( (el:string) => nameMapping.set(el, [<Track[]>[],false]) )
  return nameMapping
}

/**
* The cache contains one `Map` for each media list:
*   { playlist1: { [tracks...], last_page }, playlist2: { [tracks...], last_page } ...
*/
const FETCH_CACHE = {
  [MediaListType.LocalPlaylist]: initFetchCache(MediaListType.LocalPlaylist),
  [MediaListType.LocalAlbum]:    initFetchCache(MediaListType.LocalAlbum),
  [MediaListType.YouTube]:       initFetchCache(MediaListType.YouTube)
}

const endpointFetch = async (
  endpoint: string,
  mediaName: string,
  page: number,
  single: boolean,
  typing: MediaListType): Promise<[Track[],boolean]> => {
  const cachedList = FETCH_CACHE[typing].get(mediaName)

  if (cachedList!==undefined && cachedList[1]) {
    // Return cached data if the second field, `last_page`, has been set
    Log(`Returning cached data for ${mediaName}`)
    return cachedList
  } else {
    try {
      Log(`Fetching page ${page} for ${mediaName}`)
      const params = endpoint == "yt" ? `single=${single}` : `page=${page}`

      const data = await
      (await fetch(
        `${Config.serverUrl}/${endpoint}/${mediaName}?${params}`
      )).json()
      if ('tracks' in data && 'last_page' in data) {
        const tracks = data['tracks']
        if (endpoint.startsWith("meta")) {
          // Sort the tracks based on the album id
          tracks.sort((a:Track,b:Track) =>
            (a as LocalTrack).AlbumId - (b as LocalTrack).AlbumId
          )
        }
        const last_page = data['last_page'] as boolean;

        // Append fetched data into the cache
        const existing_value = FETCH_CACHE[typing].get(mediaName)
        let joined_values: Track[] = []
        if (existing_value !== undefined){
          joined_values = [...existing_value[0], ...tracks]
        }
        FETCH_CACHE[typing].set(mediaName, [joined_values, last_page])

        return [tracks,last_page]
      } else {
        Err(`Missing JSON key(s) in response: '${endpoint}/${mediaName}'\n`)
      }
    } catch (e: any) {
      Err(`Failed to fetch: '${endpoint}/${mediaName}'\n`, e)
    }
  }
  return [<Track[]>[],true]
}

/**
 * Fetch metadata about the given media list.
 * Returns an array of tracks and a boolean value that indicates
 * if there is more data to fetch.
 */
const fetchMediaList = async (
  mediaName: string,
  page: number,
  single: boolean,
  typing: MediaListType): Promise<[Track[],boolean]> => {
  Log("FETCH_CACHE", FETCH_CACHE)
  switch (typing) {
  case MediaListType.LocalPlaylist:
    return endpointFetch("meta/playlist", mediaName, page, single, typing) as
      Promise<[LocalTrack[],boolean]>
  case MediaListType.LocalAlbum:
    return endpointFetch("meta/album", mediaName, page, single, typing) as
      Promise<[LocalTrack[],boolean]>
  case MediaListType.YouTube:
    return endpointFetch("yt", mediaName, page, single, typing) as
      Promise<[YtTrack[],boolean]>
  }
}

/**
* Currently does not support loading pages incrementally to the frontend
* A previous implementation used a hack in `createEffect()` to accomplish this
*  See: 4d49475a338f214197db91712b8160dd5cac0654
*/
const FetchTracks = async (
  source: ActiveTuple,
): Promise<Track[]> =>  {
  Log("Change to activeTuple detected...", source)
  const el = MEDIA_LISTS[source.activeList][source.listIndex]

  const mediaName = source.activeList == MediaListType.YouTube ?
    el.getAttribute("data-id") :  el.innerHTML 

  if (mediaName == undefined || mediaName == ""){ return [] }

  // Clear the history before fetching new data
  while(TRACK_HISTORY.length>0){ TRACK_HISTORY.pop(); }
  const fetched: Track[] = []

  // Set the `?single=boolean` parameter
  let single = false
  if  (source.activeList == MediaListType.YouTube) {
    single = document.querySelector(
      `#_yt-playlists > li[data-id='${mediaName}']`
    )?.getAttribute("data-single") == "true"
  }

  let tracks: Track[] = []
  let page = 1
  let last_page = false

  while (!last_page) {
    // Incrementally fetch media until the last page of data is recieved
    [tracks, last_page] =
        await fetchMediaList(mediaName, page, single, source.activeList)
    fetched.push(...tracks)
    page++
  }

  // Sort the list in accordance with `PLAYLIST_ORDER` if applicable
  if (source.activeList == MediaListType.LocalPlaylist){
    sortPlaylist(fetched as LocalTrack[], mediaName)
  }
  return fetched
}

export {FetchTracks}
