import styles from '../scss/Tracks.module.scss';
import { Index, Show } from 'solid-js';
import { TRACK_HISTORY } from '../global';
import { Track, SourceType, YtTrack } from '../types';
import { FmtTime, Log } from '../util';

const TrackColumn = (props: {
  text: string,
  trackIdx: number,
  playingIdx: number
}) => {
  return (
    <td title={props.text}
      classList={{selected: props.trackIdx == props.playingIdx }}>
      {props.text}
    </td>
  )
}

const TrackItem = (props: {
  track: Track,
  trackIdx: number,
  playingIdx: number,
  setPlayingIdx: (arg0: number) => any,
  isPlaying: boolean
}) => {
  return (
    <tr>
      <td role="menuitem"
        title={props.track.Title}
        onClick={ () => {
          TRACK_HISTORY.push(props.playingIdx)
          Log("TRACK_HISTORY", TRACK_HISTORY)

          props.setPlayingIdx(props.trackIdx)
        }}
        classList={{selected:  props.trackIdx == props.playingIdx }}>
        <span classList={{
          [styles.amp]: props.trackIdx == props.playingIdx && props.isPlaying
        }}/>
        {props.track.Title}
      </td>
      <TrackColumn text={props.track.Album}
        trackIdx={props.trackIdx} playingIdx={props.playingIdx}
      />
      <TrackColumn text={props.track.Artist}
        trackIdx={props.trackIdx} playingIdx={props.playingIdx}
      />
      <TrackColumn text={FmtTime(props.track.Duration)}
        trackIdx={props.trackIdx} playingIdx={props.playingIdx}
      />
      <td>
        <Show when={"TrackId" in props.track}>
          <a
            data-id={(props.track as YtTrack).TrackId}
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


const Tracks = (props: {
  activeSource: SourceType,
  currentList: Track[],

  playingIdx: number,
  setPlayingIdx: (arg0: number) => any,
  isPlaying: boolean
}) => {
  return (<>
    <table>
      <thead>
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
            isPlaying={props.isPlaying}
          />
        }
        </Index>
      </tbody>
    </table>
  </>);
};

export default Tracks
