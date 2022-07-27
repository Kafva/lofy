import { Index, Show } from 'solid-js';
import { MEDIA_TITLES, MEDIA_LISTS, MediaListType } from '../config'

/**
* The media lists need reactivity so that we can keep
* track of which playlist and which item in a playlist is currently
* listIndex and update the UI accordingly
*/
const List = (props: {
  listType: MediaListType,

  activeList: MediaListType,
  setActiveList: (arg0: MediaListType) => any,

  listIndex: number,
  setListIndex: (arg0: number) => any,

  setPlayingIdx: (arg0: number) => any

}) => {
  // Note that `item` needs to be called when using <Index> and `i` needs
  // to be called for <For> components.
  // We use `role` to make elements clickable with Vimium
  return (<>
    <h3 role="menuitem"
      onClick={() => { 
        // Changing the active list will trigger re-renders for both the <Tracks>
        // and <Player>. We set the playingIdx and listIndex to invalid values
        // before switching to avoid intermediary states where another song begins playing.
        // The current approach is not perfect, each switch still has intermediary states
        // but by waiting to call `setPlayingIdx(0)` this is not noticeable for the user.
        props.setPlayingIdx(-1)
        props.setListIndex(-1)
        props.setActiveList(props.listType) 

        props.setListIndex(0)
      }}>
      {MEDIA_TITLES[props.listType]}
    </h3>

    <Show when={props.activeList == props.listType}>
      <ul>
        <Index each={MEDIA_LISTS[props.listType]}>{ (item,i) =>
          <li role="menuitem"
            onClick={ () => props.setListIndex(i) }
            data-id={item().getAttribute('data-id')}
            class={ props.listIndex == i ? "selected" : "" }>
            {item().innerHTML}
          </li>
        }
        </Index>
      </ul>
    </Show>

  </>);
};

export default List

