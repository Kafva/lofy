import { createEffect, createSignal, onMount, Setter, untrack } from 'solid-js';
import { Portal } from 'solid-js/web';
import Config from '../config';
import { TRACK_HISTORY, WORKER } from '../global';
import { Track, LocalTrack, YtTrack, SourceType, WorkerMessage } from '../types';
import { Log, FmtTime, Err, GetHTMLElement } from '../util';

/**
* The `navigator` API generally works even if the `sizes` and `type`
* are set to default values.
* !! NOTE: This API is prone to break if another application that uses !!
* !! the media key API (e.g. Spotify) is open                          !!
*/
const setNavigatorMetadata = (track: Track, imageSrc: string) => {
  navigator.mediaSession.metadata = new MediaMetadata({
    title:  track.Title,
    artist: track.Artist,
    album:  track.Album,
    artwork: [{
      src: imageSrc,
      sizes: "0x0",
      type: "image/png"
    }]
  });
}

const changeVolume = (
  newVolume: number,
  audio: HTMLAudioElement,
  setVolume: (arg0: number) => Setter<number>) => {
  const rounded = Math.round(newVolume*100)/100
  if (0.0 <= rounded && rounded <= 1.0) {
    setVolume(rounded)
    audio.volume = rounded
  }
}

/**
* This call will empty the history if all tracks in the current playlist have been played.
*/
const getNextIndex = (trackCount: number, playingIdx: number, shuffle: boolean): number => {
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

//const getAudioSrc = async (trackId:string): Promise<string>  => {
//  if (trackId !== undefined && trackId != ""){
//    if (trackId.startsWith("/")) { // Local source
//      return trackId;
//    } else {
//      return (await fetch(`/yturl/${trackId}`)).text()
//    }
//  }
//  return ""
//}


/** Seek in the <audio> based on the X coordinate of a mouse event */
const seekToPercent = (audio:HTMLAudioElement, e:MouseEvent) => {
  if (e.pageX !== undefined) {
    audio.currentTime = (e.pageX / document.body.clientWidth)*audio.duration
  }
}

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
  let img: HTMLImageElement;
  let coverBkg: HTMLDivElement;

  const [volume,setVolume] = createSignal(Config.defaultVolume)
  const [currentTime,setCurrentTime] = createSignal(0)

  const [shuffle,setShuffle] = createSignal(Config.shuffleDefaultOn)
  const [coverSource,setCoverSource] = createSignal("")

  // The YouTube Id for the current track or the server url for local tracks
  //const [audioId,setAudioId] = createSignal("")

  // `createResource()` allows us to connect a signal with an async task
  // whenever the `audioId` singal changes, the `getAudioSrc` 
  // function will re-run.
  // The resolved data is stored in `audioSrc`
  //const [audioSrc] = createResource(audioId, getAudioSrc)


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
        Log(`Setting audio source: '${props.track.Title}' - '${audioLoc}'`)
        // Update the `audioId`, triggering a new call to `getAudioSrc`
        //setAudioId(audioLoc)


        if (props.activeSource != SourceType.YouTube) {
          // Update the `audioSrc`
          setAudioSrc(audioLoc)
        } else {
          // audioSrc will be a regular signal, for local tracks we can update
          // it directly with setAudioSrc() in this effect,
          //
          // For YouTube, we will also use setAuioSrc(), but within the handler of a workers message
          // after sending the worker a signal, telling to fetch the current track and the next track
          //
          //
          // MAIN -->   {trackIdCurr: 1, trackIdNextPredicted: 2 } --> WORKER
          //
          // If YT_NEXT_ID != trackIdCurr
          //  ...fetch trackIdCurr...         --> YtUrl1
          // Else
          //  YtUrl1 := YT_NEXT_ID
          //
          // ...fetch trackIdNextPredicted... --> YT_NEXT_ID
          //
          //
          // MAIN <--   { YtUrl1 } WORKER
          WORKER.onmessageerror = (e:MessageEvent) => {
            Err("Worker error:", e)
          }
          WORKER.onmessage = (e:MessageEvent<string>) => {
            console.log('Message received from worker', e.data);
            if (e.data !== undefined && e.data != "") {
              setAudioSrc(e.data)
            }
          }

          //const nextPredictedTrackId = 
          //  getNextIndex(props.trackCount, props.playingIdx, untrack(shuffle))

          WORKER.postMessage({
            currentTrackId: audioLoc, 
            nextPredictedTrackId: "TODO"
          } as WorkerMessage)
        }

        // Trigger the `coverSource()` effect
        if (artworkUrl != untrack(coverSource)) {
          setCoverSource(artworkUrl)
        }
      }

    }
  })



  // `createEffect()` is triggered whenever a reactive component that is called 
  // within the body changes, `coverSource()` in this case.
  createEffect( () => {
    // Skip updates where the `coverSource()` is empty
    if (coverSource() !== undefined && coverSource() !== ""){
      Log(`Setting cover source: '${coverSource()}'`)
      // Update the navigators metadata
      setNavigatorMetadata(props.track, coverSource())
      // The `coverSource()` seems to lose reactivity if it is placed
      // directly in the JSX
      coverBkg.setAttribute("style",
        `background-image: url('${coverSource()}')`
      )
    }
  })

  onMount( () => {
    img       = GetHTMLElement<HTMLImageElement>("#cover > div > img")
    coverBkg  = GetHTMLElement<HTMLDivElement>("#cover > div:first-child")
    audio     = GetHTMLElement<HTMLAudioElement>("audio")
    // Initalise the <audio> with the desired default volume
    audio.volume = volume()
  })

  // <Portal> components will be inserted as direct children of the <body>
  // rather than the #root element
  //
  // The #cover needs to exist even when it is not shown so that we can
  // update the `src` field from `getAudioSource()`
  return (<>
    <Portal>
      <div hidden id="cover">
        <div/>
        <div>
          <img src={coverSource()} onLoad={()=>{
            // Maintain the original dimensions of images smaller than 600x600
            // and scale down larger images
            img.width  = img.naturalWidth  > 600 ? 600 : img.naturalWidth;
            img.height = img.naturalHeight > 600 ? 600 : img.naturalHeight;
          }}/>
          <p>{props.track.Title} ―  {props.track.Artist}</p>
        </div>
      </div>
    </Portal>

    <audio hidden autoplay preload="auto"
      src={ audioSrc() || "" }
      onTimeUpdate= {() => {
        // Update the `currentTime` every second based on the current time
        // of the <audio> element
        if (audio.currentTime <= props.track.Duration) {
          setCurrentTime(audio.currentTime)
        }
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
          <span role="button" class="nf nf-mdi-creation"
            onClick={ () => {
              const cover = document.getElementById("cover") as HTMLImageElement
              if (cover !== undefined) {
                cover.hidden = !cover.hidden
              }
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

          <span class="seperator"/>

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
            class={ props.isPlaying ? "nf nf-fa-pause" : "nf nf-fa-play" }
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

          <span class="seperator"/>

          <span title={props.track.Title}>{props.track.Title}</span>

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
          <span class="seperator"/>

          <span  role="button" class="nf nf-mdi-volume_plus" onClick={() =>
            changeVolume(volume()+Config.volumeStep, audio, setVolume)
          }/>
          <span>{ Math.round(volume()*100) + " %" }</span>
          <span  role="button" class="nf nf-mdi-volume_minus" onClick={() =>
            changeVolume(volume()-Config.volumeStep, audio, setVolume)
          }/>
        </div>
        <div onClick={(e:MouseEvent) => seekToPercent(audio,e)}/>
        <div onClick={(e:MouseEvent) => seekToPercent(audio,e)}
          style={{
            "width": `${Math.floor(105*(currentTime()/props.track.Duration))}%`
          }}
        />
      </nav>
    </Portal>
  </>);
};

export default Player
