import { Index, Show } from 'solid-js';
import { Track, MediaListType, YtTrack } from '../types';
import { DisplayTime } from '../util';

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
      <td>{DisplayTime(props.track.Duration)}</td>
      <td>
        <Show when={"TrackId" in props.track}>
          <a 
            class="nf nf-mdi-link"
            target="_blank"
            href={
              `https://youtube.com/watch?v=${(props.track as YtTrack).TrackId}`
            }
          />
        </Show>
      </td>
    </tr>);
};


/**
* The `Tracks` component will fetch Tracks from the server
* based on a provided the currently selected item
*/
const Tracks = (props: {
  activeList: MediaListType,
  currentList: Track[],

  playingIdx: number,
  setPlayingIdx: (arg0: number) => any
}) => {

  return (<>
    <table>
      <thead>
        <th class="nf nf-fa-circle_o_notch"/>
        <th class="nf nf-mdi-music"/>
        <th class="nf nf-mdi-library_music"/>
        <th class="nf nf-oct-person"/>
        <th class="nf nf-mdi-timelapse"/>
        <th/>
      </thead>
      <tbody>
        <Index each={props.currentList}>{(item,i) =>
          <TrackItem track={item()} 
            trackIdx={i}
            playingIdx={props.playingIdx} 
            setPlayingIdx={props.setPlayingIdx}
          />
        }
        </Index>
      </tbody>
    </table>
  </>);
};

export default Tracks
