import { createEffect, createSignal, For, Show } from 'solid-js';
import { MEDIA_TITLES, MEDIA_LISTS, MediaListType } from '../config'

/**
* The media lists need reactivity so that we can keep
* track of which playlist and which item in a playlist is currently
* selected and update the UI accordingly
*/
const List = (props: {
  listType: MediaListType
  activeList: MediaListType,
  setActiveList: (arg0: MediaListType) => any,
}) => {
  const [selected,setSelected] = createSignal(-1)

  createEffect(() => {
    console.log(props.activeList, props.listType);
  });

  // Note that `i` needs to be called
  // We use `role` to make elements clickable with Vimium
  return (<>

    <h3 role="menuitem"
      onClick={() => props.setActiveList(props.listType)}>
      {MEDIA_TITLES[props.listType]}
    </h3>

    <Show when={props.activeList == props.listType}>
      <ul>
        <For each={MEDIA_LISTS[props.listType]}>{ (item,i) =>
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

  </>);
};

export default List

