import styles from '../scss/List.module.scss';
import { batch, createSignal, Index, Show } from 'solid-js';
import { SOURCE_LISTS, SOURCE_TITLE_CLASSES} from '../ts/global'
import { LocalStorageKeys, SourceType, Track } from '../ts/types';

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
      <ul>
        <Index each={SOURCE_LISTS[props.listType]}>{ (item,i) =>
          <li role="menuitem"
            onClick={ () => {
              // To avoid intermediary states we batch the updates to:
              //  The selected medialist,
              //  The selected playlist/album
              // batch() will combine several signal changes into one re-render.
              batch(() => {
                props.setActiveSource(props.listType)
                props.setListIndex(i)
                props.setPlayingIdx(-1)
                props.setCurrentList([] as Track[])
              })
              localStorage.setItem(LocalStorageKeys.activeSource, props.activeSource.toFixed(0))
              localStorage.setItem(LocalStorageKeys.listIndex, i.toString())
            }}
            data-id={item().getAttribute('data-id')}>
            <span title={item().innerHTML}
              classList={{selected:
                (props.listIndex == i && props.listType == props.activeSource)}}
            >
              {item().innerHTML}
            </span>
            <Show when={props.listType == SourceType.YouTube}>
              <a
                class="nf nf-mdi-link"
                target="_blank"
                href={getYtLink(item())}
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

