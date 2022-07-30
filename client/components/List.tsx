import { batch, createSignal, Index, Show, For } from 'solid-js';
import { SHORTCUTS } from '../config'
import { 
  ACTIVE_LIST_KEY, LIST_INDEX_KEY, SOURCE_LISTS, SOURCE_TITLE_CLASSES 
} from '../global'
import { SourceType, Track } from '../types';

const getYtLink = (item: HTMLLIElement): string => {
  const ytParam = item.getAttribute('data-single') == "true" ? "v" : "list"
  return `https://youtube.com/watch?${ytParam}=${item.getAttribute('data-id')}`
}

/**
* The media lists need reactivity so that we can keep
* track of which playlist and which item in a playlist is currently
* listIndex and update the UI accordingly
*/
const List = (props: {
  listType: SourceType,

  activeSource: SourceType,
  setActiveSource: (arg0: SourceType) => any,
  setCurrentList: (arg0: Track[]) => any,

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
        selected: props.activeSource == props.listType,
        [SOURCE_TITLE_CLASSES[props.listType]]: true,
      }}
      onClick={() => {
        // Collapse or open the list if the currently selected list
        // is pressed anew
        if (props.listType == props.activeSource){
          setShow(!show());
        } else {
          // To avoid intermediary states we batch the updates to:
          //  The selected medialist,
          //  The selected playlist/album
          // batch() will combine several signal changes into one re-render.
          batch( () => {
            props.setActiveSource(props.listType)
            props.setListIndex(0)
            // Setting this to zero without waiting for `FetchTracks`
            // can cause the 0th track of the previous list to start playing
            // The index is explicitly set to zero by the <App> once 
            // `FetchTracks` completes
            props.setPlayingIdx(-1)
            props.setCurrentList([] as Track[])
            setShow(true)
          })
          localStorage.setItem(ACTIVE_LIST_KEY, props.activeSource.toFixed(0))
          localStorage.setItem(LIST_INDEX_KEY,  props.listIndex.toFixed(0))
        }
      }}/>
    <Show when={props.activeSource == props.listType && show()}>
      <ul>
        <Index each={SOURCE_LISTS[props.listType]}>{ (item,i) =>
          <li role="menuitem"
            onClick={ () => {
              batch( () => {
                props.setListIndex(i)
                props.setPlayingIdx(-1)
                props.setCurrentList([] as Track[])
              })
              localStorage.setItem(LIST_INDEX_KEY, i.toString())
            }}
            data-id={item().getAttribute('data-id')}>
            <span title={item().innerHTML}
              classList={{selected:  props.listIndex == i}}>
              {item().innerHTML}
            </span>
            <Show when={props.listType == SourceType.YouTube}>
              <a
                class="nf nf-mdi-link"
                target="_blank"
                href={ getYtLink(item()) }
              />
            </Show>
          </li>
        }
        </Index>
      </ul>
    </Show>

    <div hidden id="shortcuts">
      <For each={SHORTCUTS}>{(shortcut) =>
        <span onClick={ () => {
          // Switch to the playlist indicated by the shortcut
          // Each hidden span element is given a shortcut in `controls.ts`
          batch( () => {
            props.setActiveSource(shortcut.activeSource)
            props.setListIndex(shortcut.listIndex)
            props.setPlayingIdx(-1)
            props.setCurrentList([] as Track[])
            setShow(true)
          })
          localStorage.setItem(ACTIVE_LIST_KEY, shortcut.activeSource.toFixed())
          localStorage.setItem(LIST_INDEX_KEY,  shortcut.listIndex.toFixed())
        }}/>
      }
      </For>
    </div>

  </>);
};

export default List

