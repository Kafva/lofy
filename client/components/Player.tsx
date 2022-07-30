import { createEffect, createResource, createSignal, onMount, Setter, untrack } from 'solid-js';
import { Portal } from 'solid-js/web';
import Config from '../config';
import { TRACK_HISTORY } from '../global';
import { Track, LocalTrack, YtTrack, MediaListType } from '../types';
import { Log, DisplayTime, Err } from '../util';

/** Generic getter for DOM elements */
function getHTMLElement<Type extends Element>(selector:string): Type {
  const el = document.querySelector(selector) as Type;
  if (el == undefined) {
    throw `No element found matching ${selector}`
  }
  return el
}

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
* Pick a random index  if shuffle() is set, otherwise
* increment `playingIdx` by one (wrapping around for last track).
*/
const setNextTrack = (
  trackCount: number,

  setPlayingIdx: (arg0: number) => any,
  playingIdx: number,

  shuffle: boolean,
) => {
  let newIndex: number

  TRACK_HISTORY.push(playingIdx)
  Log("TRACK_HISTORY", TRACK_HISTORY)

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
  setPlayingIdx(newIndex)
}

const getAudioSrc = async (trackId:string): Promise<string>  => {
  if (trackId !== undefined && trackId != ""){
    if (trackId.startsWith("/")) { // Local source
      return trackId;
    } else {
      const ytUrl = (await fetch(`/yturl/${trackId}`)).text()
      return ytUrl
    }
  }
  return ""
}


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

  activeList: MediaListType,

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
  const [audioId,setAudioId] = createSignal("")

  // `createResource()` allows us to connect a signal with an async task
  // whenever the `audioId` singal changes, the `getAudioSrc` function will re-run.
  // The resolved data is stored in `audioSrc`
  // `mutate()` allows us to set `audioSrc` directly without using `getAudioSrc`.
  const [audioSrc] = createResource(audioId, getAudioSrc)

  // Update the audio source whenever the track changes
  // `createEffect()` is triggered whenever
  // reactive components inside the function are
  // modified, i.e. `track` in this case.
  createEffect( () => {
    if (props.track !== undefined && props.track.Title != "") {
      /**
      * The source for the audio element can be determined for local resources
      * using the `Track.AlbumFS` and `Track.AlbumId` attributes.
      * For YouTube resources a request to the server
      * that determine the audio source is needed
      */
      let artwork_url = ""
      let audio_src = ""

      if ('AlbumFS' in props.track) { // Local files (no async required)
        const l = props.track as LocalTrack
        artwork_url = `/art/${l.AlbumFS}/${l.AlbumId}`
        audio_src = `/audio/${l.AlbumFS}/${l.AlbumId}`

      } else if ('TrackId' in props.track) { // YouTube
        const y = props.track as YtTrack
        artwork_url = y.ArtworkUrl;
        audio_src = y.TrackId;
      }

      if (audio_src!=""){
        Log(`Setting audio source: '${props.track.Title}' - '${audio_src}'`)
        // Update the `audioId`, triggering a new call to `getAudioSrc`
        setAudioId(audio_src)

        // Trigger the `coverSource()` effect
        if (artwork_url != untrack(coverSource)) {
          setCoverSource(artwork_url)
        }
      }

    }
  })

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
    // Initalise the <audio> with the desired default volume
    img       = getHTMLElement<HTMLImageElement>("#cover > div > img")
    coverBkg  = getHTMLElement<HTMLDivElement>("#cover > div:first-child")
    audio     = getHTMLElement<HTMLAudioElement>("audio")
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
            // Media from the same origin as the server is on the autoplay allowlist by default
            // other sources require 'interaction from the user' before being auto-playable
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
                const newPos = audio.currentTime - 60*Config.sameTrackSeekStepMin
                if (newPos > 0){
                  audio.currentTime = newPos
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
              // For long tracks, e.g.
              //  https://www.youtube.com/watch?v=_-8yfNLG5e8
              // We skip ahead `Config.seekStepMin` minutes instead
              // of moving to the next track
              if (props.track.Duration >= 60*Config.sameTrackSkipMin) {
                const newPos = audio.currentTime + 60*Config.sameTrackSeekStepMin
                if (newPos <= audio.duration){
                  audio.currentTime = newPos
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
              const newPos = audio.currentTime - Config.seekStepSec
              if (newPos >= 0){
                audio.currentTime = newPos
              }
            }}
          />
          <span>{
            `${DisplayTime(currentTime())} / ${DisplayTime(props.track.Duration)}`
          }</span>
          <span  role="button"
            class="nf nf-fa-forward" onClick={ () => {
              const newPos = audio.currentTime + Config.seekStepSec
              if (newPos <= audio.duration){
                audio.currentTime = newPos
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
