import { createEffect, createResource, createSignal } from 'solid-js';
import Config, { MediaListType, MEDIA_LISTS } from '../config';


/**
* The `Tracks` component will fetch Tracks from the server
* based on a provided the currently selected item
*/
const Tracks = (props: {
  activeList: MediaListType,

  selected: number,
  setSelected: (arg0: number) => any,
}) => {
  
  //[current,setCurrent] = createSignal(props.activeList)

  //createEffect( () => {
  //  fetchMediaList(MEDIA_LISTS[props.activeList][props.selected].innerHTML,  props.activeList)
  //  
  //})

  //const [lol] = createResource(MEDIA_LISTS[props.activeList][props.selected].innerHTML,  props.activeList, fetchMediaList)
  //  <p> { lol() } </p>

  return (<>
    <p>{ "Current tracks: "+ props.activeList+" "+props.selected }</p>
  </>);
};

export default Tracks
