import styles from '../scss/App.module.scss';
import { createSignal, For, createResource, createEffect, Show, Suspense }
  from 'solid-js';
import List from './List';
import Tracks from './Tracks';
import Player from './Player';
import Loading from './Loading';
import { MsgBox } from './MsgBox';
import { SOURCE_LISTS, } from '../ts/global'
import { FetchTracks } from '../ts/fetch';
import { SourceType, EmptyTrack, Track, ActiveTuple, LocalStorageKeys } from '../ts/types';
import { Log } from '../ts/util';
import Search from './Search';

const App = () => {
  // Restore values from a previous session if possible
  let prevActiveSource = parseInt(
    localStorage.getItem(LocalStorageKeys.activeSource)|| "0"
  ) as SourceType
  let prevListIndex  = parseInt(
    localStorage.getItem(LocalStorageKeys.listIndex) || "0"
  )
  // Fallback to 0:0 if the cached index does not exist
  if (SOURCE_LISTS[prevActiveSource].length <= prevListIndex) {
    prevActiveSource = 0
    prevListIndex = 0
  }

  // Iterable over source types (enum)
  const sourceTypes = [
    SourceType.LocalPlaylist, SourceType.LocalAlbum, SourceType.YouTube
  ]

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

  // Query string for searches among the items in each <List/>
  const [queryString,setQueryString] = createSignal("")

  // The currently playing track in the current list
  const [playingIdx,setPlayingIdx] = createSignal(0)

  // True if playback is not paused
  const [isPlaying,setIsPlaying] = createSignal(true)

  // Derived signals for the current track and track count
  const currentTrack = (): Track => {
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

  Log("Visualiser: " + (localStorage.getItem(LocalStorageKeys.visualiser) != null ?
    "active" : "inactive")
  )

  return (<>
    <MsgBox/>
    <div class={styles.sidebar}>
      <Search setQueryString={(s:string) => setQueryString(s)}/>
      <For each={sourceTypes}>{(listType: SourceType) =>
        // We can pass the setter function to a child in `props`
        <List
          listType={listType}
          queryString={queryString()}

          activeSource={activeSource()}
          setActiveSource={(s:SourceType)=> setActiveSource(s)}
          setCurrentList={mutate}

          listIndex={listIndex()}
          setListIndex={(s:SourceType)=>setListIndex(s)}
          setPlayingIdx={(s:number)=>setPlayingIdx(s)}
        />
      }</For>
    </div>

    <Show when={SOURCE_LISTS[activeSource()].length > 0}
      fallback={<p class={styles.unavail}>No data available for current source</p>}
    >
      <Suspense fallback={<Loading/>}>
        <Tracks
          currentList={currentList() || [] as Track[]}
          playingIdx={playingIdx()}
          setPlayingIdx={(s:number)=>setPlayingIdx(s)}
          isPlaying={isPlaying()}
        />
      </Suspense>

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
