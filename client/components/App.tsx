import { createSignal, Index, createEffect } from 'solid-js';
import { createStore } from "solid-js/store";
import List from './List';
import Tracks from './Tracks';
import Player from './Player';
import Config, { LIST_TYPES, MEDIA_LISTS, PLAYLIST_ORDER, TRACK_HISTORY } from '../config'
import { FetchMediaList } from '../fetch';
import { MediaListType, EmptyTrack, Track, LocalTrack, PlaylistEntry } from '../types';

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

const App = () => {
  // Restore values from a previous session if possible
  const prevActiveList = parseInt(
    localStorage.getItem(Config.activeListKey)|| "0"
  ) as MediaListType
  const prevListIndex  = parseInt(
    localStorage.getItem(Config.listIndexKey) || "0"
  )

  // Flag to determine the active media list
  const [activeList,setActiveList] = createSignal(prevActiveList)

  // Flag to determine the selected index in the current list
  const [listIndex,setListIndex] = createSignal(prevListIndex)

  // Array with all of the tracks in the current list
  const [currentList,setCurrentList] = createStore([])

  // The currently playing track in the current list
  const [playingIdx,setPlayingIdx] = createSignal(0)

  // True if playback is not paused
  const [isPlaying,setIsPlaying] = createSignal(true)

  // Fetch metadata about a list whenever the listIndex() or activeList() changes
  createEffect( () => {
    if (listIndex() >= 0 ) {
      const el = MEDIA_LISTS[activeList()][listIndex()]
      const mediaName = activeList() == MediaListType.YouTube ?
        el.getAttribute("data-id") :  el.innerHTML

      if (mediaName !== null && mediaName != "") {
        (async() => {
          // Clear the current list and history before fetching new data
          setCurrentList([])
          while(TRACK_HISTORY.length>0){ TRACK_HISTORY.pop(); }

          // Set the `?single=boolean` parameter 
          let single = false
          if  (activeList() == MediaListType.YouTube) {
            single = document.querySelector(`#_yt-playlists > li[data-id='${mediaName}']`)
              ?.getAttribute("data-single") == "true"
          }

          let tracks: Track[] = []
          let page = 1
          let last_page = false

          while (!last_page) {
            // Incrementally fetch media until the last page of data is recieved
            [tracks, last_page] = 
              await FetchMediaList(mediaName, page, single, activeList())

            // Sort the list in accordance with `PLAYLIST_ORDER` if applicable
            const updated_list = [...currentList,...tracks]

            if (activeList() == MediaListType.LocalPlaylist){
              sortPlaylist(updated_list as LocalTrack[], mediaName)
            }

            setCurrentList(updated_list)

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
    <div id="sidebar">
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
    </div>

    <Tracks
      activeList={activeList()}
      currentList={currentList}

      playingIdx={playingIdx()}
      setPlayingIdx={(s:number)=>setPlayingIdx(s)}
      isPlaying={isPlaying()}
    />

    <Player
      track={ currentList[playingIdx()] !== undefined ?
        currentList[playingIdx()] :
        EmptyTrack()
      }
      trackCount={currentList.length}

      setPlayingIdx={(s:number)=>setPlayingIdx(s)}
      playingIdx={playingIdx()}

      setIsPlaying={(s:boolean)=>setIsPlaying(s)}
      isPlaying={isPlaying()}
    />
  </>)
};

export default App;
