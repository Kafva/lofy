import styles from '../scss/List.module.scss';
import { batch, createSignal, For, Show } from 'solid-js';
import { SOURCE_LISTS, SOURCE_TITLE_CLASSES} from '../ts/global'
import { LocalStorageKeys, SourceType, Track } from '../ts/types';
import { Err } from '../ts/util';

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
  const [show,setShow] = createSignal(false)

  // Note that `item` needs to be called when using <Index> and `i` needs
  // to be called for <For> components.
  // We use `role` to make elements clickable with Vimium
  return (<>
    <h3 role={SOURCE_LISTS[props.listType].length != 0 ? "menuitem" : undefined}
      classList={{
        selected: props.activeSource == props.listType,
        [SOURCE_TITLE_CLASSES[props.listType]]: true,
        [styles.disabled]: SOURCE_LISTS[props.listType].length == 0
      }}
      onClick={() => {
        // Only react to clicks if the list has at least one item
        if (SOURCE_LISTS[props.listType].length != 0) {
          setShow(!show());
        }
      }}/>
    <Show when={show()}>
      <ul
        onClick={(e:Event) => { // Single onclick handler for each <ul>
          const el = e.target as HTMLElement

          // If the click was onto a <span>, the parent will have the data-row
          const row = el.getAttribute("data-row") != undefined ?
                      el.getAttribute("data-row") : // eslint-disable-line indent
                      el.parentElement!.getAttribute("data-row")

          if (row == undefined || isNaN(parseInt(row))) {
            Err("Missing or invalid data-row on event target and/or parent", e)
          } else {
            // To avoid intermediary states we batch the updates to:
            //  The selected medialist,
            //  The selected playlist/album
            // batch() will combine several signal changes into one re-render.
            batch(() => {
              props.setActiveSource(props.listType)
              props.setListIndex(parseInt(row))
              props.setPlayingIdx(-1)
              props.setCurrentList([] as Track[])
            })
            localStorage.setItem(LocalStorageKeys.activeSource, props.activeSource.toFixed(0))
            localStorage.setItem(LocalStorageKeys.listIndex, row.toString())
          }
        }}
      >
        <For each={SOURCE_LISTS[props.listType]}>{ (item,i) =>
          <li role="menuitem"
            data-id={item.getAttribute('data-id')}
            data-row={i()}
          >
            
            <span title={item.innerHTML}
              classList={{selected:
                (props.listIndex == i() && props.listType == props.activeSource)}}
            >
              {item.innerHTML}
            </span>
            <Show when={props.listType == SourceType.YouTube}>
              <a
                class="nf nf-mdi-link"
                target="_blank"
                href={getYtLink(item)}
              />
            </Show>
          </li>
        }
        </For>
      </ul>
    </Show>
  </>);
};

export default List

