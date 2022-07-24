import { createSignal } from 'solid-js';
import List from './List';
import { TITLES, LIST_SELECTORS } from './config'

const App = () => {
  const [activeList,setActiveList] = createSignal("_playlists")

  // We can pass the setter function to a child as a normal prop
  return (
    <For each={LIST_SELECTORS}>{(selector) =>
      <List setActiveList={(s)=> setActiveList(s)} 
            activeList={activeList()} 
            selector={selector} 
      />
    }</For>
  )
};

export default App;
