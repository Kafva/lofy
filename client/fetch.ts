import { LocalTrack, YtTrack, Track } from './types';
import Config, { Err, Log, MediaListType, MEDIA_LISTS } from './config';

const initFetchCache = (mediaList: MediaListType): Map<string,[Track[],boolean]> => {
  let mediaListNames = [];
  if (mediaList == MediaListType.YouTube) {
    mediaListNames = 
      MEDIA_LISTS[mediaList].map( (el:HTMLLIElement) => 
        el.getAttribute("data-id")?.toString())
  } else {
    mediaListNames = 
      MEDIA_LISTS[mediaList].map( (el:HTMLLIElement) => 
        el.innerHTML?.toString() )
  }

  const nameMapping = new Map<string, [Track[],boolean]>()
  mediaListNames.forEach( (el:string) => nameMapping.set(el, [<Track[]>[],false]) )
  return nameMapping
}

/**
* The cache contains one `Map` for each media list:
*   { playlist1: { [tracks...], fully_loaded }, playlist2: { [tracks...], fully_loaded } ...
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
  typing: MediaListType): Promise<[Track[],boolean]> => {
  const cachedList = FETCH_CACHE[typing].get(mediaName)

  if (cachedList!==undefined && cachedList[1]) {
    // Return cached data if the second field (`fully_loaded`) has been set
    Log(`Returning cached data for ${mediaName}`)
    return cachedList 
  } else {
    try {
      Log(`Fetching page ${page} for ${mediaName}`)
      const data = await 
      (await fetch(
        `${Config.serverUrl}/${endpoint}/${mediaName}?page=${page}`)
      ).json()
      if ('tracks' in data && 'last_page' in data) {
        const tracks = data['tracks']
        if (endpoint.startsWith("meta")) {
          // Sort the tracks based on the album id
          tracks.sort((a:Track,b:Track) => 
            (a as LocalTrack).AlbumId - (b as LocalTrack).AlbumId
          )
        }
        const last_page = data['last_page'] as boolean;

        // Save the fetched data into the cache
        FETCH_CACHE[typing].set(mediaName, [tracks,last_page])

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
const FetchMediaList = async (
  mediaName: string, 
  page: number,
  typing: MediaListType): Promise<[Track[],boolean]> => {
  switch (typing) {
  case MediaListType.LocalPlaylist:
    return endpointFetch("meta/playlist", mediaName, page, typing) as 
      Promise<[LocalTrack[],boolean]>
  case MediaListType.LocalAlbum:
    return endpointFetch("meta/album", mediaName, page, typing) as 
      Promise<[LocalTrack[],boolean]>
  case MediaListType.YouTube:
    return endpointFetch("yt", mediaName, page, typing) as 
      Promise<[YtTrack[],boolean]>
  }
}

export {FetchMediaList}
