import styles from '../scss/Tracks.module.scss';
import { For, Show } from 'solid-js';
import { TRACK_HISTORY } from '../ts/global';
import { Track } from '../ts/types';
import type { YtTrack } from '../ts/types';
import { Err, FmtTime, Log } from '../ts/util';

const Tracks = (props: {
  currentList: Track[],
  playingIdx: number,
  setPlayingIdx: (arg0: number) => any,
  isPlaying: boolean
}) => (<>
    <table
        onClick={ (e:Event) => {
            // Single dispatch event listener for all entries in the table
            const el = e.target as HTMLElement

            // Only react to clicks on the first <td/>
            if (el.getAttribute("role") != "menuitem") {
                return
            }

            // The parent will have the data-row
            const row = el.parentElement!.getAttribute("data-row")

            if (row == undefined || isNaN(parseInt(row))) {
                Err("Missing or invalid data-row on event target and/or parent", e)
            } else {
                TRACK_HISTORY.push(props.playingIdx)
                Log("TRACK_HISTORY", TRACK_HISTORY)
                props.setPlayingIdx(parseInt(row))
            }
        }}
    >
        <thead>
            <tr>
                <th class="nf nf-mdi-music"/>
                <th class="nf nf-mdi-library_music"/>
                <th class="nf nf-oct-person"/>
                <th class="nf nf-mdi-timelapse"/>
                <Show when={props.currentList.length > 0 && "TrackId" in props.currentList[0]}>
                    <th/>
                </Show>
            </tr>
        </thead>
        <tbody>
            <For each={props.currentList}>{(item: Track, i) =>
                <tr data-row={i()}>
                    <td role="menuitem"
                        title={item.Title}
                        classList={{selected:  i() == props.playingIdx }}>
                        <span classList={{
                            [styles.amp]: i() == props.playingIdx && props.isPlaying
                        }}/>
                        {item.Title}
                    </td>

                    <td title={item.Album}>{item.Album}</td>
                    <td title={item.Artist}>{item.Artist}</td>
                    <td>{FmtTime(item.Duration)}</td>
                    <Show when={"TrackId" in item}>
                        <td>
                            <a
                                data-id={(item as YtTrack).TrackId}
                                class="nf nf-mdi-link"
                                target="_blank"
                                href={
                                    `https://youtube.com/watch?v=${(item as YtTrack).TrackId}`
                                }
                            />
                        </td>
                    </Show>
                </tr>
            }
            </For>
        </tbody>
    </table>
</>)

export default Tracks
