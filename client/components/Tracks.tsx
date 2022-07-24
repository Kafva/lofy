import { Index } from 'solid-js';
import Config, { MediaListType, MEDIA_LISTS } from '../config';
import { LocalTrack, YtTrack, Track } from '../types';


/**
* The `Tracks` component will fetch Tracks from the server
* based on a provided the currently selected item
*/
const Tracks = (props: {
  activeList: MediaListType,

  selected: number,
  setSelected: (arg0: number) => any,
  currentList: Track[]
}) => {
  
  return (<>
    <p>{ "Current tracks: "+ props.activeList+" "+props.selected }</p>

    <Index each={props.currentList}>{(item,_) =>
      <li>{ item().Title }</li>
    }
    </Index>

  </>);
};

export default Tracks
