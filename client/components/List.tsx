import { batch, createSignal, Index, Show } from 'solid-js';
import Config, { MEDIA_TITLES, MEDIA_LISTS, MEDIA_TITLE_CLASSES } from '../config'
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
  // Determines if the currently selected list should be collapsed or open
  const [show,setShow] = createSignal(true)
  
  // Note that `item` needs to be called when using <Index> and `i` needs
  // to be called for <For> components.
  // We use `role` to make elements clickable with Vimium
  return (<>
    <h3 role="menuitem"
      classList={{
        selected: props.activeList == props.listType,
        [MEDIA_TITLE_CLASSES[props.listType]]: true,
      }}
      onClick={() => { 
        // Collapse or open the list if the currently selected list
        // is pressed anew
        if (props.listType == props.activeList){
          setShow(!show());
        } else {
          // To avoid intermediary states we batch the updates to: 
          //  The selected medialist, 
          //  The selected playlist/album 
          // batch() will combine several signal changes into one re-render.
          // The selected track is only set to valid value _after_
          // the new playlist has been loaded in <App>
          batch( () => {
            props.setActiveList(props.listType) 
            props.setListIndex(0)
            // Setting this to zero without waiting for FetchTracks to finish seeeeems fine?
            props.setPlayingIdx(0) 
            setShow(true)
          })
          localStorage.setItem(Config.activeListKey, props.activeList.toFixed(0))
          localStorage.setItem(Config.listIndexKey,  props.listIndex.toFixed(0))
        }
      }}>
      {MEDIA_TITLES[props.listType]}
    </h3>

    <Show when={props.activeList == props.listType && show()}>
      <ul>
        <Index each={MEDIA_LISTS[props.listType]}>{ (item,i) =>
          <li role="menuitem"
            onClick={ () => { 
              props.setListIndex(i) 
              localStorage.setItem(Config.listIndexKey, i.toString())
            }}
            data-id={item().getAttribute('data-id')}>
            <span classList={{selected:  props.listIndex == i }}>{item().innerHTML}</span>
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

