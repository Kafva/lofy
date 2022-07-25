import { createSignal, Index, createEffect } from 'solid-js';
import { createStore } from "solid-js/store";
import List from './List';
import Tracks from './Tracks';
import Player from './Player';
import { MediaListType, LIST_TYPES, MEDIA_LISTS } from '../config'
import { FetchMediaList } from '../fetch';
import { EmptyTrack, Track } from '../types';

const App = () => {
  // Flag to determine the active media list
  const [activeList,setActiveList] = createSignal(MediaListType.LocalPlaylist)

  // Flag to determine the selected index in the current list
  const [selected,setSelected] = createSignal(0)

  // Array with all of the tracks in the current list
  const [currentList,setCurrentList] = createStore([]) 

  // The currently playing track in the current list
  const [playingIdx,setPlayingIdx] = createSignal(0)

  createEffect( () => {
    // TODO: Paging with <Suspense> loading
    if (selected() >= 0 && playingIdx() >= 0) {
      // Skip calls to `FetchMediaList` if the `selected()` 
      // list or track is set to -1
      const el = MEDIA_LISTS[activeList()][selected()]
      const mediaName = activeList() == MediaListType.YouTube ? 
        el.getAttribute("data-id") :  el.innerHTML 
    
      if (mediaName !== null && mediaName != "") {
        FetchMediaList(mediaName, activeList())
          .then((t:Track[]) => setCurrentList(t))
      }
    }
  })

  // Unlike <For>, <Index> components will not be re-rendered
  // if the underlying data in an array changes
  // the lists are not going to change so it is therefore preferable
  // to use <Index> in this case.
  return (<>

    <Index each={LIST_TYPES}>{(listType) =>
      // We can pass the setter function to a child as in `props`
      <List 
        listType={listType()}

        activeList={activeList()}
        setActiveList={(s:MediaListType)=> setActiveList(s)}

        selected={selected()}
        setSelected={(s:MediaListType)=>setSelected(s)}
        setPlayingIdx={(s:number)=>setPlayingIdx(s)}
      />
    }</Index>

    <Tracks 
      activeList={activeList()} 
      currentList={currentList}

      playingIdx={playingIdx()} 
      setPlayingIdx={(s:number)=>setPlayingIdx(s)}
    />


    <Player
      track={ currentList[playingIdx()] !== undefined ?
        currentList[playingIdx()] :
        EmptyTrack()
      }
      playingIdx={playingIdx()} 
      setPlayingIdx={(s:number)=>setPlayingIdx(s)}
    />

  </>)
};

export default App;
