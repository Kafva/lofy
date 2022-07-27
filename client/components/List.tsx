import { batch, Index, Show } from 'solid-js';
import { MEDIA_TITLES, MEDIA_LISTS } from '../config'
import { MediaListType } from '../types';

const get_yt_link = (item: HTMLLIElement): string => {
  const yt_param = item.getAttribute('data-single') == "true" ? "v" : "list"
  return `https://youtube.com/watch?${yt_param}=${item.getAttribute('data-id')}`
}

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
        // To avoid intermediary states we batch the updates to: 
        //  The selected medialist, 
        //  The selected playlist/album 
        // batch() will combine several signal changes into one re-render.
        // The selected track is only set to valid value _after_
        // the new playlist has been loaded in <App>
        batch( () => {
          props.setActiveList(props.listType) 
          props.setListIndex(0)
          props.setPlayingIdx(-1)
        })
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
            <Show when={props.listType == MediaListType.YouTube}>
              <a 
                class="nf nf-mdi-link"
                target="_blank"
                href={ get_yt_link(item()) }
              />
            </Show>
          </li>
        }
        </Index>
      </ul>
    </Show>

  </>);
};

export default List

