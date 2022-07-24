/* @refresh reload */
import { render } from 'solid-js/web';
import './scss/index.scss';
import App from './components/App';


import { LocalTrack, YtTrack, Track } from './types';
import Config, { MediaListType } from './config';


const endpointFetch = async (endpoint: string, name: string): Promise<Track[]> => {
  const baseUrl = 
      `${Config.serverProto}://${Config.serverIp}:${Config.serverPort}`

  let tracks = []

  try {
    const data = await (await fetch(`${baseUrl}/${endpoint}/${name}`)).json()
    console.log(data)
    if ('tracks' in data) {
      tracks = data['tracks']
    }
  } catch (e: any) {
    console.error(`Failed to fetch: '${endpoint}/${name}'\n`, e)
  } finally {
    return tracks
  }
}

const fetchMediaList = async (name: string, typing: MediaListType): Promise<Track[]> => {
  switch (typing) {
  case MediaListType.LocalPlaylist:
    return endpointFetch("meta/playlist", name) as Promise<LocalTrack[]>
  case MediaListType.LocalAlbum:
    return endpointFetch("meta/album", name) as Promise<LocalTrack[]>
  case MediaListType.YouTube:
    return endpointFetch("yt", name) as Promise<YtTrack[]>
  }
}

// (async()=>{
//   console.log( await fetchMediaList("86", MediaListType.LocalAlbum) )
//   console.log( await fetchMediaList("JB", MediaListType.LocalPlaylist) )
//   console.log( await fetchMediaList("PLOHoVaTp8R7dfrJW5pumS0iD_dhlXKv17", MediaListType.YouTube) )
// })()


render(() => <App />, document.getElementById('root') as HTMLElement);
