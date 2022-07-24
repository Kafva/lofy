import { createSignal, splitProps } from 'solid-js';

/**
* The `Tracks` component will fetch Tracks from the server
* based on a provided `MediaList`
* The `mediaList` object needs to be updated based on click events
* within a `List` component
*/
const Tracks = (props: {
  activeList: MediaListType,

  selected: number,
  setSelected: (arg0: number) => any,
}) => {
  
  return (<>
    <p>{  "Current tracks: "+ props.activeList+" "+props.selected }</p>
  </>);
};

export default Tracks
