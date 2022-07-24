import { createSignal, splitProps } from 'solid-js';
import { LISTS } from './config'

/// The lists need reactivity so that we can keep
/// track of which playlist and which item in a playlist is currently
/// selected and update the UI accordingly
const List = (props: {activeList: string, selector: string}) => {
  
  const [selected,setSelected] = createSignal(-1)
  
  // Note that `i` needs to be called
  // We use `role` to make elements clickable with Vimium
  return (
  <Show when={props.activeList==props.selector}>
  <ul> 
    <For each={LISTS[props.selector]}>{ (item,i) =>
      <li role="menuitem"
          onClick={ () => setSelected(i()) } 
          data-id={item.getAttribute('data-id')} 
          class={ selected() == i() ? "selected" : "" }>
        {item.innerHTML}
      </li>
    }
    </For>
  </ul>
  </Show>

  );

};

export default List

