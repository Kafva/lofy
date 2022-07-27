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
  const [listIndex,setListIndex] = createSignal(0)

  // Array with all of the tracks in the current list
  const [currentList,setCurrentList] = createStore([]) 

  // The currently playing track in the current list
  const [playingIdx,setPlayingIdx] = createSignal(0)

  // Fetch metadata about a list whenever the listIndex() or activeList() changes
  createEffect( () => {
    if (listIndex() >= 0 ) {
      const el = MEDIA_LISTS[activeList()][listIndex()]
      const mediaName = activeList() == MediaListType.YouTube ? 
        el.getAttribute("data-id") :  el.innerHTML 
    
      if (mediaName !== null && mediaName != "") {
        (async() => {
          // Clear the current list before fetching new data
          setCurrentList([])

          let tracks: Track[] = []
          let page = 1
          let last_page = false

          while (!last_page) {
            // Incrementally fetch media until the last page of data is recieved
            [tracks, last_page] = await FetchMediaList(mediaName, page, activeList())

            setCurrentList([...currentList,...tracks]) 

            if (page == 1) {
              // Auto-select the first entry in the media list
              // once the first page has loaded 
              setPlayingIdx(0)
            }
            page++
          }
        })();
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

        listIndex={listIndex()}
        setListIndex={(s:MediaListType)=>setListIndex(s)}
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
      trackCount={currentList.length}
      playingIdx={playingIdx()} 
      setPlayingIdx={(s:number)=>setPlayingIdx(s)}
    />
  </>)
};

export default App;
