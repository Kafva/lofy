import { createSignal } from 'solid-js';
import List from './List';
import { TITLES, LIST_SELECTORS } from './config'

const App = () => {
  
  const [activeList,setActiveList] = createSignal("_playlists")

  return (
    <For each={LIST_SELECTORS}>{(selector, _) =>
      <>
      <h3 role="menuitem" 
          onClick={() => setActiveList(selector)}>
          {TITLES[selector]}
      </h3>
      <List activeList={activeList()} selector={selector} />
      </>
    }</For>
  )
};

export default App;
