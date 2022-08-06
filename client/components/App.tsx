import styles from '../scss/App.module.scss';
import { createSignal, Index, createResource, createEffect, Show } from 'solid-js';
import List from './List';
import Tracks from './Tracks';
import Player from './Player';
import { ACTIVE_LIST_KEY, LIST_INDEX_KEY, SOURCE_LISTS, SOURCE_TYPES } from '../global'
import { FetchTracks } from '../fetch';
import { SourceType, EmptyTrack, Track, ActiveTuple } from '../types';

const App = () => {
  // Restore values from a previous session if possible
  let prevActiveSource = parseInt(
    localStorage.getItem(ACTIVE_LIST_KEY)|| "0"
  ) as SourceType
  let prevListIndex  = parseInt(
    localStorage.getItem(LIST_INDEX_KEY) || "0"
  )
  // Fallback to 0:0 if the cached index does not exist
  if (SOURCE_LISTS[prevActiveSource].length <= prevListIndex) {
    prevActiveSource = 0
    prevListIndex = 0
  }

  // Flag to determine the active media list
  const [activeSource,setActiveSource] = createSignal(prevActiveSource)

  // Flag to determine the selected index in the current list
  const [listIndex,setListIndex] = createSignal(prevListIndex)

  // Derived signal that incorporates each attribute needed for a data fetch
  const activeTpl = () => {
    return {
      'activeSource': activeSource(),
      'listIndex': listIndex(),
    } as ActiveTuple
  }

  // Array with all of the tracks in the current list
  const [currentList,{mutate}] = createResource(activeTpl, FetchTracks)

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

  // Change to index 0 if the index has been set to -1
  // (caused from switching source) and fetching from `FetchTracks` has finished
  createEffect( () => {
    if (playingIdx() == -1){
      const curr = currentList();
      // To ensure that we do not consider the previous list as a 'new',
      // we zero out the `currentList()` on a switch
      if (curr !== undefined && curr.length > 0 && !currentList.loading){
        setPlayingIdx(0);
      }
    }
  })

  // Unlike <For>, <Index> components will not be re-rendered
  // if the underlying data in an array changes
  // the lists are not going to change so it is therefore preferable
  // to use <Index> in this case.
  return (<>
    <div class={styles.sidebar}>
      <Index each={SOURCE_TYPES}>{(listType) =>
        // We can pass the setter function to a child as in `props`
        <List
          listType={listType()}

          activeSource={activeSource()}
          setActiveSource={(s:SourceType)=> setActiveSource(s)}
          setCurrentList={mutate}

          listIndex={listIndex()}
          setListIndex={(s:SourceType)=>setListIndex(s)}
          setPlayingIdx={(s:number)=>setPlayingIdx(s)}
        />
      }</Index>
    </div>

    <Show when={SOURCE_LISTS[activeSource()].length > 0}
      fallback={<p class={styles.unavail}>No data available for current source</p>}
    >
      <Tracks
        activeSource={activeSource()}
        currentList={currentList() || [] as Track[]}

        playingIdx={playingIdx()}
        setPlayingIdx={(s:number)=>setPlayingIdx(s)}
        isPlaying={isPlaying()}
      />

      <Player
        track={currentTrack()}
        trackCount={currentTrackCount()}
        activeSource={activeSource()}

        setPlayingIdx={(s:number)=>setPlayingIdx(s)}
        playingIdx={playingIdx()}

        setIsPlaying={(s:boolean)=>setIsPlaying(s)}
        isPlaying={isPlaying()}
      />
    </Show>
  </>)
};

export default App;
