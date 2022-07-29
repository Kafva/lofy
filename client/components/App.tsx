import { createSignal, Index, createResource } from 'solid-js';
import List from './List';
import Tracks from './Tracks';
import Player from './Player';
import Config, { LIST_TYPES } from '../config'
import { FetchTracks } from '../fetch';
import { MediaListType, EmptyTrack, Track, ActiveTuple } from '../types';

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

  // Derived signal that incorporates each attribute needed for a data fetch
  const activeTpl = () => {
    return {
      'activeList': activeList(),
      'listIndex': listIndex(),
    } as ActiveTuple
  }

  // Array with all of the tracks in the current list
  const [currentList] = createResource(activeTpl, FetchTracks)

  // The currently playing track in the current list
  const [playingIdx,setPlayingIdx] = createSignal(0)

  // True if playback is not paused
  const [isPlaying,setIsPlaying] = createSignal(true)

  // Derived signals for the current track and track count
  const currentTrack = ():Track => {
    const curr = currentList();
    if (curr !== undefined && curr[playingIdx()] !== undefined) {
      return curr[playingIdx()]
    }
    return EmptyTrack()
  }
  const currentTrackCount = ():number => {
    const curr = currentList();
    return curr !== undefined ? curr.length : 0
  }

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
      currentList={currentList() || [] as Track[]}

      playingIdx={playingIdx()}
      setPlayingIdx={(s:number)=>setPlayingIdx(s)}
      isPlaying={isPlaying()}
    />

    <Player
      track={currentTrack()}
      trackCount={currentTrackCount()}

      setPlayingIdx={(s:number)=>setPlayingIdx(s)}
      playingIdx={playingIdx()}

      setIsPlaying={(s:boolean)=>setIsPlaying(s)}
      isPlaying={isPlaying()}
    />
  </>)
};

export default App;
