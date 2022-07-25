import { createSignal, Index, createEffect } from 'solid-js';
import List from './List';
import Tracks from './Tracks';
import { MediaListType, LIST_TYPES, MEDIA_LISTS } from '../config'
import { FetchMediaList } from '../fetch';

const App = () => {
  // Flag to determine the active media list
  const [activeList,setActiveList] = createSignal(MediaListType.LocalPlaylist)

  // Flag to determine the selected index in the current list
  const [selected,setSelected] = createSignal(0)

  const [currentList,setCurrentList] = createSignal([]) 

  createEffect( () => {
    if (selected() >= 0) {
      // Skip calls to `FetchMediaList` if `selected` is set to -1
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
      // We can pass the setter function to a child as a normal prop
      <List 
        listType={listType()}

        activeList={activeList()}
        setActiveList={(s:MediaListType)=> setActiveList(s)}

        selected={selected()}
        setSelected={(s:MediaListType)=>setSelected(s)}
      />
    }</Index>

    <Tracks activeList={activeList()} 
      selected={selected()} 
      setSelected={(s:number)=> setSelected(s)} 
      currentList={currentList()}
    />
  </>)
};

export default App;
