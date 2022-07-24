import { createSignal, Index, createEffect } from 'solid-js';
import List from './List';
import Tracks from './Tracks';
import { MediaListType, LIST_TYPES, MEDIA_LISTS, Log } from '../config'


import { LocalTrack, YtTrack, Track } from '../types';
import Config from '../config';

const endpointFetch = async (endpoint: string, name: string): Promise<Track[]> => {
  const baseUrl = 
      `${Config.serverProto}://${Config.serverIp}:${Config.serverPort}`

  let tracks = []

  try {
    const data = await (await fetch(`${baseUrl}/${endpoint}/${name}`)).json()
    Log(data)
    if ('tracks' in data) {
      tracks = data['tracks']
    } else {
      console.error(`Missing tracks in response: '${endpoint}/${name}'\n`)
    }
  } catch (e: any) {
    console.error(`Failed to fetch: '${endpoint}/${name}'\n`, e)
  } finally {
    return tracks // eslint-disable-line no-unsafe-finally
  }
}

/**
 * Fetch metadata about the given media list
 */
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

const App = () => {
  // Flag to determine the active media list
  const [activeList,setActiveList] = createSignal(MediaListType.LocalPlaylist)

  // Flag to determine the selected index in the current list
  const [selected,setSelected] = createSignal(0)

  const [currentList,setCurrentList] = createSignal([]) 

  createEffect( () => {
    const el = MEDIA_LISTS[activeList()][selected()]
    const mediaName = activeList() == MediaListType.YouTube ? 
                      el.getAttribute("data-id") :  el.innerHTML 
  
    if (mediaName != "") {
      Log(`Fetching data for ${mediaName}`)
      // TODO: This triggers everytime that we select a new media list entry
      // we should cache these requests and only make new requests
      // if we are missing data
      fetchMediaList(mediaName, activeList())
        .then( (t:Track[]) => setCurrentList(t) )
    }
  })

  
  // Unlike <For>, <Index> components will not be re-rendered
  // if the underlying data in an array changes
  // the lists are not going to change so it is therefore preferable
  // to use <Index> in this case.
  return (<>
    <Index each={LIST_TYPES}>{(listType) =>
      // We can pass the setter function to a child as a normal prop
      <List 
        listType={listType()}

        activeList={activeList()}
        setActiveList={(s)=> setActiveList(s)}

        selected={selected()}
        setSelected={(s)=>setSelected(s)}
      />
    }</Index>

    <Tracks activeList={activeList()} 
      selected={selected()} 
      setSelected={(s)=> setSelected(s)} 
      currentList={currentList()}
    />
  </>)
};

export default App;
