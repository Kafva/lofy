import { SourceType, LocalTrack, Track, ActiveTuple, PlaylistEntry } from './types';
import { SOURCE_LISTS, TRACK_HISTORY, PLAYLIST_ORDER } from './global';
import { Err, Log } from './util';

/**
* Sort an array of `LocalTrack` objects such that they are in the
* order indicated by a `PlaylistEntry` array from `PLAYLIST_ORDER`
*/
const sortPlaylist = (unsorted: LocalTrack[], playlistName: string) => {
  unsorted.sort( (a:LocalTrack,b:LocalTrack) => {
    const plIndexA = PLAYLIST_ORDER.get(playlistName)!.findIndex(
      (e:PlaylistEntry) => e.AlbumFS==a.AlbumFS && e.AlbumId == a.AlbumId
    )
    const plIndexB = PLAYLIST_ORDER.get(playlistName)!.findIndex(
      (e:PlaylistEntry) =>
        e.AlbumFS==b.AlbumFS && e.AlbumId == b.AlbumId
    )
    return plIndexA - plIndexB
  })
}

const initFetchCache = (
  mediaSource: SourceType
): Map<string,[Track[],boolean]> => {
  let mediaSourceNames: string[] = [];
  if (mediaSource == SourceType.YouTube) {
    mediaSourceNames =
      SOURCE_LISTS[mediaSource].map( (el:HTMLLIElement) =>
        el.getAttribute("data-id")!.toString())
  } else {
    mediaSourceNames =
      SOURCE_LISTS[mediaSource].map( (el:HTMLLIElement) =>
        el.innerHTML!.toString() )
  }

  const nameMapping = new Map<string, [Track[],boolean]>()
  mediaSourceNames.forEach( (el:string) =>
    nameMapping.set(el, [<Track[]>[],false])
  )
  return nameMapping
}

/**
* The cache contains one `Map` for each media list:
*   { playlist: { [tracks...], last_page } ... }
*/
const FETCH_CACHE = {
  [SourceType.LocalPlaylist]: initFetchCache(SourceType.LocalPlaylist),
  [SourceType.LocalAlbum]:    initFetchCache(SourceType.LocalAlbum),
  [SourceType.YouTube]:       initFetchCache(SourceType.YouTube)
}

/**
* Fetch metadata about the given media list.
* Returns an array of tracks and a boolean value that indicates
* if there is more data to fetch.
*/
const endpointFetch = async (
  endpoint: string,
  mediaName: string,
  page: number,
  single: boolean,
  typing: SourceType): Promise<[Track[],boolean]> => {
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
        `/${endpoint}/${mediaName}?${params}`
      )).json()
      if ('tracks' in data && 'last_page' in data) {
        const tracks = data['tracks']
        if (endpoint.startsWith("meta")) {
          // Sort the tracks based on the album id
          tracks.sort((a:Track,b:Track) =>
            (a as LocalTrack).AlbumId - (b as LocalTrack).AlbumId
          )
        }
        const lastPage = data['last_page'] as boolean;

        // Append fetched data into the cache
        const existingValues = FETCH_CACHE[typing].get(mediaName)
        let joinedValues: Track[] = []
        if (existingValues !== undefined){
          joinedValues = [...existingValues[0], ...tracks]
        }
        FETCH_CACHE[typing].set(mediaName, [joinedValues, lastPage])

        return [tracks,lastPage]
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
* Currently does not support loading pages incrementally to the frontend
* A previous implementation used a hack in `createEffect()` to accomplish this
*  See: 4d49475a338f214197db91712b8160dd5cac0654
*/
const FetchTracks = async (
  source: ActiveTuple
): Promise<Track[]> =>  {
  Log("Change to activeTuple detected...", source)
  const el = SOURCE_LISTS[source.activeSource][source.listIndex]

  const mediaName = source.activeSource == SourceType.YouTube ?
    el.getAttribute("data-id") :  el.innerHTML

  if (mediaName == undefined || mediaName == ""){ return [] }

  // Clear the history before fetching new data
  while(TRACK_HISTORY.length>0){ TRACK_HISTORY.pop(); }
  const fetched: Track[] = []

  // Set the `?single=boolean` parameter
  let single = false
  if  (source.activeSource == SourceType.YouTube) {
    single = document.querySelector(
      `#_yt-playlists > li[data-id='${mediaName}']`
    )?.getAttribute("data-single") == "true"
  }

  let endpoint = ""
  let tracks: Track[] = []
  let page = 1
  let lastPage = false

  while (!lastPage) {
    switch (source.activeSource) {
    case SourceType.LocalPlaylist:
      endpoint = "meta/playlist"
      break;
    case SourceType.LocalAlbum:
      endpoint = "meta/album"
      break;
    case SourceType.YouTube:
      endpoint = "yt"
      break;
    }

    // Incrementally fetch media until the last page of data is recieved
    [tracks, lastPage] = await endpointFetch(
      endpoint, mediaName, page, single, source.activeSource
    ) as [Track[],boolean]

    fetched.push(...tracks)
    page++
  }

  // Sort the list in accordance with `PLAYLIST_ORDER` if applicable
  if (source.activeSource == SourceType.LocalPlaylist){
    sortPlaylist(fetched as LocalTrack[], mediaName)
  }
  // Log("FETCH_CACHE", FETCH_CACHE)
  return fetched
}

export {FetchTracks}
