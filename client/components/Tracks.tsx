import { createSignal, Index } from 'solid-js';
import { MediaListType } from '../config';
import { Track } from '../types';

const TrackItem = (props: {
  track: Track,
  trackIdx: number,
  playingIdx: number,
  setPlayingIdx: (arg0: number) => any
}) => {
  return (
    <tr role="menuitem" 
      onClick={ () => props.setPlayingIdx(props.trackIdx) }>
      <td class={props.trackIdx == props.playingIdx ? "amp" : ""}/>
      <td>{props.track.Title}</td>
      <td>{props.track.Album}</td>
      <td>{props.track.Artist}</td>
      <td>{props.track.Duration}</td>
    </tr>);
};


const Player = (props: {
}) => {


};

/**
* The `Tracks` component will fetch Tracks from the server
* based on a provided the currently selected item
*/
const Tracks = (props: {
  activeList: MediaListType,
  currentList: Track[]
}) => {

  const [playingIdx,setPlayingIdx] = createSignal(0)

  return (<>
    <p>{ "Current tracks: "+ props.activeList+" " }</p>
    <table>
      <thead>
        <th class="nf nf-fa-circle_o_notch"/>
        <th class="nf nf-mdi-music"/>
        <th class="nf nf-mdi-library_music"/>
        <th class="nf nf-oct-person"/>
        <th class="nf nf-mdi-timelapse"/>
      </thead>
      <tbody>
        <Index each={props.currentList}>{(item,i) =>
          <TrackItem track={item()} 
            trackIdx={i}
            playingIdx={playingIdx()} 
            setPlayingIdx={(s:number)=>setPlayingIdx(s)}
          />
        }
        </Index>
      </tbody>
    </table>
  </>);
};

export default Tracks
