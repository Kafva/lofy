import { createSignal } from 'solid-js';
import List from './List';
import Tracks from './Tracks';
import { MediaListType, LIST_TYPES } from './config'

const App = () => {
  const [activeList,setActiveList] = createSignal(MediaListType.LocalPlaylist)


  return (<>
    <For each={LIST_TYPES}>{(listType) =>
      // We can pass the setter function to a child as a normal prop
      <List setActiveList={(s)=> setActiveList(s)}
            activeList={activeList()}
            listType={listType}
      />
    }</For>

    <Tracks/>
  </>)
};

export default App;
