import { LocalTrack, YtTrack, Track } from './types';
import Config, { Log, MediaListType, MEDIA_LISTS } from './config';

const initFetchCache = (mediaList: MediaListType): Map<string,Track[]> => {
  let mediaListNames = [];
  if (mediaList == MediaListType.YouTube) {
    mediaListNames = 
      MEDIA_LISTS[mediaList].map( (el:HTMLLIElement) => 
                                 el.getAttribute("data-id")!.toString())
  } else {
    mediaListNames = 
      MEDIA_LISTS[mediaList].map( (el:HTMLLIElement) => 
                                 el.innerHTML?.toString() )
  }

  const nameMapping = new Map<string, Track[]>()
  mediaListNames.forEach( (el:string) => nameMapping.set(el, <Track[]>[]) )
  return nameMapping
}

/**
* The cache contains one `Map` for each media list:
*   { playlist1: [ tracks ], playlist2: [ tracks ] ...
*/
const FETCH_CACHE = {
  [MediaListType.LocalPlaylist]: initFetchCache(MediaListType.LocalPlaylist),
  [MediaListType.LocalAlbum]:    initFetchCache(MediaListType.LocalAlbum),
  [MediaListType.YouTube]:       initFetchCache(MediaListType.YouTube)
}

const endpointFetch = async (
 endpoint: string, 
 mediaName: string, 
 typing: MediaListType): Promise<Track[]> => {
  let tracks = <Track[]>[]
  const baseUrl = 
      `${Config.serverProto}://${Config.serverIp}:${Config.serverPort}`

  const cachedList = FETCH_CACHE[typing].get(mediaName)

  if (cachedList!==undefined && cachedList.length > 0) {
    // Return cached data if possible
    Log(`Returning cached data for ${mediaName}`)
    tracks = cachedList 
  } else {
    try {
      Log(`Fetching data for ${mediaName}`)
      const data = await 
        (await fetch(`${baseUrl}/${endpoint}/${mediaName}`)).json()
      if ('tracks' in data) {
        // Save the fetched data into the cache
        tracks = data['tracks']
        FETCH_CACHE[typing].set(mediaName, tracks)
      } else {
        console.error(
          `Missing tracks in response: '${endpoint}/${mediaName}'\n`
        )
      }
    } catch (e: any) {
      console.error(`Failed to fetch: '${endpoint}/${mediaName}'\n`, e)
    } 
  }
  return tracks
}

/**
 * Fetch metadata about the given media list
 */
const FetchMediaList = async (
 mediaName: string, 
 typing: MediaListType): Promise<Track[]> => {
  switch (typing) {
  case MediaListType.LocalPlaylist:
    return endpointFetch("meta/playlist", mediaName, typing) as 
      Promise<LocalTrack[]>
  case MediaListType.LocalAlbum:
    return endpointFetch("meta/album", mediaName, typing) as 
      Promise<LocalTrack[]>
  case MediaListType.YouTube:
    return endpointFetch("yt", mediaName, typing) as 
      Promise<YtTrack[]>
  }
}

export {FetchMediaList}
