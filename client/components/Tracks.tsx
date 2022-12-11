import styles from '../scss/Tracks.module.scss';
import { For, Show } from 'solid-js';
import { TRACK_HISTORY } from '../ts/global';
import { Track } from '../ts/types';
import type { YtTrack } from '../ts/types';
import { FmtTime, Log } from '../ts/util';
//      <For each={props.currentList}>{(item: Track, i) =>
//        <tr>
//          <td role="menuitem"
//            title={item.Title}
//            onClick={ () => {
//              TRACK_HISTORY.push(props.playingIdx)
//              Log("TRACK_HISTORY", TRACK_HISTORY)
//
//              props.setPlayingIdx(i())
//            }}
//            classList={{selected:  i() == props.playingIdx }}>
//            <span classList={{
//              [styles.amp]: i() == props.playingIdx && props.isPlaying
//            }}/>
//            {item.Title}
//          </td>
//
//          <td title={item.Album}>{item.Album}</td>
//          <td title={item.Artist}>{item.Artist}</td>
//          <td>{FmtTime(item.Duration)}</td>
//          <Show when={"TrackId" in item}>
//            <td>
//              <a
//                data-id={(item as YtTrack).TrackId}
//                class="nf nf-mdi-link"
//                target="_blank"
//                href={
//                  `https://youtube.com/watch?v=${(item as YtTrack).TrackId}`
//                }
//              />
//            </td>
//          </Show>
//        </tr>
//      }
//      </For>

// <span>{FmtTime(item.Duration)}</span>


//      <For each={props.currentList}>{(item: Track) =>
//        <div 
//          //onClick={ () => {
//          //  TRACK_HISTORY.push(props.playingIdx)
//          //  Log("TRACK_HISTORY", TRACK_HISTORY)
//          //  props.setPlayingIdx(i())
//          //}}
//          //classList={{selected:  i() == props.playingIdx }}>{item.Title} - {i()}
//        >
//
//          <span>{item.Artist}</span>
//          <span>{item.Album}</span>
//
//        </div>
//      }
//      </For>


// Using the i() and attributes should be fine!
const Tracks = (props: {
  currentList: Track[],
  playingIdx: number,
  setPlayingIdx: (arg0: number) => any,
  isPlaying: boolean
}) => (<>
  <table>
    <thead>
      <th class="nf nf-mdi-music"/>
      <th class="nf nf-mdi-library_music"/>
      <th class="nf nf-oct-person"/>
      <th class="nf nf-mdi-timelapse"/>
      <th/>
    </thead>
    <tbody>
    </tbody>
  </table>
</>)

export default Tracks
