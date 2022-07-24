import { Index, Show } from 'solid-js';
import { MEDIA_TITLES, MEDIA_LISTS, MediaListType } from '../config'

/**
* The media lists need reactivity so that we can keep
* track of which playlist and which item in a playlist is currently
* selected and update the UI accordingly
*/
const List = (props: {
  listType: MediaListType,

  activeList: MediaListType,
  setActiveList: (arg0: MediaListType) => any,

  selected: number,
  setSelected: (arg0: number) => any,
}) => {
  // Note that `item` needs to be called when using <Index> and `i` needs
  // to be called for <For> components.
  // We use `role` to make elements clickable with Vimium
  return (<>

    <h3 role="menuitem"
      onClick={() => { 
        // Auto-select the first entry of a list when switching to it
        // To avoid an intermediary state where we fetch data for the 0th
        // entry of the current list we set the selection to -1 temporarily
        props.setSelected(-1)
        props.setActiveList(props.listType) 
        props.setSelected(0)
      }}>
      {MEDIA_TITLES[props.listType]}
    </h3>

    <Show when={props.activeList == props.listType}>
      <ul>
        <Index each={MEDIA_LISTS[props.listType]}>{ (item,i) =>
          <li role="menuitem"
            onClick={ () => props.setSelected(i) }
            data-id={item().getAttribute('data-id')}
            class={ props.selected == i ? "selected" : "" }>
            {item().innerHTML}
          </li>
        }
        </Index>
      </ul>
    </Show>

  </>);
};

export default List

