import { createSignal, Index } from 'solid-js';
import List from './List';
import Tracks from './Tracks';
import { MediaListType, LIST_TYPES } from '../config'

const App = () => {
  // Flag to determine the active media list
  const [activeList,setActiveList] = createSignal(MediaListType.LocalPlaylist)

  // Flag to determine the selected index in the current list
  const [selected,setSelected] = createSignal(0)
  
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
    />
  </>)
};

export default App;
