import styles from '../scss/Player.module.scss';
import { createEffect, createSignal, onMount, untrack } from 'solid-js';
import { Portal } from 'solid-js/web';
import Config from '../config';
import { TRACK_HISTORY, WORKER } from '../global';
import { Track, LocalTrack, YtTrack, SourceType } from '../types';
import { Log, FmtTime, Err, GetHTMLElement } from '../util';
import Cover from './Cover';
import ProgressBar from './ProgressBar';
import Volume from './Volume';

/**
* Determine the next track index, taking shuffle() into account.
* This call will empty the history if all tracks in the current playlist
* have been played.
*/
const getNextIndex = (
  trackCount: number,
  playingIdx: number,
  shuffle: boolean
): number => {
  let newIndex: number
  if (shuffle && trackCount>1) {
    // If all songs in the playlist have been played,
    // Clear the history
    if (trackCount == TRACK_HISTORY.length) {
      while(TRACK_HISTORY.length>0) { TRACK_HISTORY.pop(); }
    }
    do  {
      newIndex = Math.floor(trackCount*Math.random())
      // Pick a new index if there is an overlap with the current track or
      // the history.
    } while (newIndex == playingIdx || TRACK_HISTORY.indexOf(newIndex) != -1)
  } else {
    newIndex = playingIdx+1 >= trackCount ? 0 : playingIdx+1
  }
  return newIndex
}

/**
* Pick a random index  if shuffle() is set, otherwise
* increment `playingIdx` by one (wrapping around for last track).
* This call also updates the `TRACK_HISTORY`
*/
const setNextTrack = (
  trackCount: number,
  setPlayingIdx: (arg0: number) => any,
  playingIdx: number,
  shuffle: boolean,
) => {
  TRACK_HISTORY.push(playingIdx)
  Log("TRACK_HISTORY", TRACK_HISTORY)

  const newIndex = getNextIndex(trackCount, playingIdx, shuffle)
  setPlayingIdx(newIndex)
}

//const drawAmp = (analyser: AnalyserNode, canvas: HTMLCanvasElement) => {
//  //requestAnimationFrame( () => {
//
//  //});
//
//  //analyser.getByteFrequencyData(dataArray);
//
//  //canvasCtx.fillStyle = "rgb(0, 0, 0)";
//  //canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);
//
//  //const barWidth = (WIDTH / bufferLength) * 2.5;
//  //let barHeight;
//  //let x = 0;
//
//  //for (let i = 0; i < bufferLength; i++) {
//  //  barHeight = dataArray[i];
//
//  //  canvasCtx.fillStyle = `rgb(${barHeight + 100}, 50, 50)`;
//  //  canvasCtx.fillRect(x, HEIGHT - barHeight / 2, barWidth, barHeight / 2);
//
//  //  x += barWidth + 1;
//  //}
//}

/**
* Holds the actual <audio> element used to play a track
* and all the buttons for controlling playback
* Alternative helper library:
*  https://github.com/solidjs-community/solid-primitives/tree/main/packages/audio
*/
const Player = (props: {
  track: Track,
  trackCount: number,

  activeSource: SourceType,

  setPlayingIdx: (arg0: number) => any
  playingIdx: number,

  setIsPlaying: (arg0: boolean) => any,
  isPlaying: boolean
}) => {
  let audio: HTMLAudioElement;
  let analyser: AnalyserNode;
  let frequencyData: Uint8Array;
  let canvas: HTMLCanvasElement;
  let canvasCtx: CanvasRenderingContext2D;

  const [volume,setVolume] = createSignal(Config.defaultVolume)
  const [currentTime,setCurrentTime] = createSignal(0)

  const [shuffle,setShuffle] = createSignal(Config.shuffleDefaultOn)
  const [coverSource,setCoverSource] = createSignal("")

  const [audioSrc, setAudioSrc] = createSignal("")

  // Update the audio source whenever the `prop.track` changes
  createEffect( () => {
    if (props.track !== undefined && props.track.Title != "") {
      /**
      * The source for the audio element can be determined for local resources
      * using the `Track.AlbumFS` and `Track.AlbumId` attributes.
      * For YouTube resources a request to the server
      * that determine the audio source is needed
      */
      let artworkUrl = ""
      let audioLoc = ""

      if ('AlbumFS' in props.track) { // Local files (no async required)
        const l = props.track as LocalTrack
        artworkUrl = `/art/${l.AlbumFS}/${l.AlbumId}`
        audioLoc = `/audio/${l.AlbumFS}/${l.AlbumId}`

      } else if ('TrackId' in props.track) { // YouTube
        const y = props.track as YtTrack
        artworkUrl = y.ArtworkUrl;
        audioLoc = y.TrackId;
      }

      if (audioLoc!="") {
        if (props.activeSource != SourceType.YouTube) {
          // Update the `audioSrc`
          Log(`Setting audio source: '${props.track.Title}' - '${audioLoc}'`)
          setAudioSrc(audioLoc)
        } else {
          // Send a message to the webworker requesting the next YouTube URL
          // and update the audio source when a response is received
          WORKER.onmessageerror = (e:MessageEvent) => {
            Err("Worker error:", e)
          }
          WORKER.onmessage = (e:MessageEvent<string>) => {
            if (e.data !== undefined && e.data != "") {
              Log(`Setting audio source: '${props.track.Title}' - '${e.data}'`)
              setAudioSrc(e.data)
            } else {
              Err(`Failed to retrieve audio URL for '${props.track.Title}', `+
                "the video could be limitied to 'YouTube Music'."
              )
            }
          }

          // Passing the entire <Tracks> list to this component is
          // not preferable so we extract the `trackId` directly from the DOM
          let nextPredictedTrackId = ""
          const nextPredictedTrackIndex =
            getNextIndex(props.trackCount, props.playingIdx, untrack(shuffle))

          const nextPredictedTrack =
            document.querySelector(
              `tr:nth-child(${nextPredictedTrackIndex+1}) > td:last-child > a`
            )
          if (nextPredictedTrack!==null){
            nextPredictedTrackId =
              nextPredictedTrack.getAttribute("data-id")!.toString()
          }

          WORKER.postMessage({
            currentTrackId: audioLoc,
            nextPredictedTrackId: nextPredictedTrackId
          })
        }

        // Trigger a re-render of <Cover>
        if (artworkUrl != untrack(coverSource)) {
          setCoverSource(artworkUrl)
        }
      }
    }
  })

  onMount( () => {
    // Initialise the <audio> with the desired default volume
    audio     = GetHTMLElement<HTMLAudioElement>("audio")
    audio.volume = volume()

    // https://developer.mozilla.org/en-US/docs/Web/API/AudioNode
    // Source nodes:      0  inputs, 1+ outputs
    // Destination nodes: 1+ inputs, 0  outputs
    // Analyser nodes:    1+ inputs, 1+ outputs
    //
    // Connect the OUTPUT of `node1` to the INPUT of `node2`
    // node1.connect(node2)

    // Initialise audio context for sound visualisation
    const audioCtx = new window.AudioContext();

    // Create a SRC node (1 output no input) for the <audio>
    const srcNode = audioCtx.createMediaElementSource(audio)

    // Create an analyser which can read the frequency data of the node
    //  maxDecibels: -30
    //  minDecibels: -100
    analyser = audioCtx.createAnalyser();

    frequencyData = new Uint8Array(analyser.frequencyBinCount)

    // Set the OUTPUT of the `srcNode` to the INPUT of the analyser...
    srcNode.connect(analyser)
    // ...and set the OUTPUT of the analyzer to be the INPUT for
    // the audio context destination
    analyser.connect(audioCtx.destination)

    //canvas = GetHTMLElement<HTMLCanvasElement>("canvas");
    //canvasCtx = canvas.getContext("2d")!;
  })

  return (<>
    <audio hidden autoplay preload="auto"
      src={ audioSrc() || "" }
      onTimeUpdate= {() => {
        // Update the `currentTime` every second based on the current time
        // of the <audio> element
        if (audio.currentTime <= props.track.Duration) {
          setCurrentTime(audio.currentTime)
        }
        //if (analyser) {
        //  // Note: the array will be zeroed out if the audio is muted.
        //  // The array will contain 1024 values [0-255], each index
        //  // represents the decibel value for a specific Hz value
        //  // The frequencies are spread linerarly from
        //  //  0 Hz to [sample rate / 2] Hz
        //  //
        //  // The <canvas> will visualise these values with bars of differing height
        //  analyser.getByteFrequencyData(frequencyData)
        //  //Log("Frequency data", frequencyData)

        //  canvasCtx.clearRect(0,0,400,200);
        //  canvasCtx.fillStyle = "rgb(110, 133, 211)"
        //  canvasCtx.fillRect( Math.random()*200 ,20,20,50);
        //}
      }}
      onLoadedData={ () => {
        // Resume playback if needed
        if (audio.paused){
          audio.play().catch( (e:DOMException) => {
            // Media from the same origin as the server is on the autoplay
            // allowlist by default other sources require
            // 'interaction from the user' before being auto-playable
            //  https://developer.mozilla.org/en-US/docs/Web/Media/Autoplay_guide#autoplay_availability
            Err("Autoplay failed: ", e)
          })
        }

        // Ensure that the play-button state is toggled
        props.setIsPlaying(true)
      }}
      onEnded={ () => {
        setNextTrack(props.trackCount,
          props.setPlayingIdx, props.playingIdx, shuffle()
        )
        setCurrentTime(0)
      }}
    />


    <Portal>
      <nav>
        <div>
          <Cover track={props.track} coverSource={coverSource()}/>

          <span role="button"
            class="nf nf-fae-wind"
            onClick={ () => {
              const percent = props.playingIdx / props.trackCount
              const fullHeight = document.body.scrollHeight
              const scrollTo = Math.floor(percent*fullHeight) - window.innerHeight/2
              window.scroll(0,Math.max(0,scrollTo))
            }}
          />

          <span role="button"
            class={shuffle() ? "nf nf-mdi-shuffle_variant" :
              "nf nf-mdi-shuffle_disabled"
            }
            onClick={ () => {
              setShuffle(!shuffle())
            }}
          />

          <span class={styles.seperator}/>

          <span role="button"
            class="nf nf-mdi-skip_previous"
            onClick={ () => {
              // Seek skipping for long tracks
              if (props.track.Duration >= 60*Config.sameTrackSkipMin) {
                const newTime =
                  audio.currentTime - 60*Config.sameTrackSeekStepMin
                if (newTime > 0){
                  audio.currentTime = newTime
                }
              } else {
                const prevIndex = TRACK_HISTORY.pop();
                Log("TRACK_HISTORY", TRACK_HISTORY, "(popped)", prevIndex)

                if (prevIndex != null) {
                  props.setPlayingIdx(prevIndex)
                  setCurrentTime(0)
                  props.setIsPlaying(true)
                }
              }
            }}
          />
          <span role="button"
            class={props.isPlaying ? "nf nf-fa-pause" : "nf nf-fa-play"}
            onClick={ () => {
              if (audio.paused) {
                audio.play()
              } else {
                audio.pause()
              }
              props.setIsPlaying(!audio.paused)
            }}
          />
          <span role="button"
            class="nf nf-mdi-skip_next"
            onClick={ () => {
              // For long tracks we skip ahead `Config.seekStepMin` minutes
              // instead of moving to the next track
              if (props.track.Duration >= 60*Config.sameTrackSkipMin) {
                const newTime =
                  audio.currentTime + 60*Config.sameTrackSeekStepMin
                if (newTime <= audio.duration){
                  audio.currentTime = newTime
                }
              } else {
                setNextTrack(props.trackCount,
                  props.setPlayingIdx, props.playingIdx, shuffle()
                )
                setCurrentTime(0)
                props.setIsPlaying(true)
              }
            }}
          />

          <span class={styles.seperator}/>
          <span class={styles.track_name} title={props.track.Title}>{props.track.Title}</span>
          <span class={styles.seperator}/>

          <span  role="button"
            class="nf nf-fa-backward" onClick={ () => {
              const newTime = audio.currentTime - Config.seekStepSec
              if (newTime >= 0){
                audio.currentTime = newTime
              }
            }}
          />
          <span>{
            `${FmtTime(currentTime())} / ${FmtTime(props.track.Duration)}`
          }</span>
          <span  role="button"
            class="nf nf-fa-forward" onClick={ () => {
              const newTime = audio.currentTime + Config.seekStepSec
              if (newTime <= audio.duration){
                audio.currentTime = newTime
              }
            }}
          />
          <span class={styles.seperator}/>
          <Volume volume={volume()} setVolume={(s:number)=>setVolume(s)}/>
        </div>
        <ProgressBar track={props.track} currentTime={currentTime()}/>
      </nav>
    </Portal>
  </>);
};

export default Player
