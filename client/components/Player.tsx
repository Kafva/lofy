import { createEffect, createSignal, onMount, Setter } from 'solid-js';
import { Portal } from 'solid-js/web';
import Config, { TRACK_HISTORY } from '../config';
import { Track, LocalTrack, YtTrack } from '../types';
import { Log, Err, DisplayTime } from '../util';


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

/**
* The source for the audio element can be determined for local resources
* using the `Track.AlbumFS` and `Track.AlbumId` attributes.
* For YouTube resources a request to the server
* that determine the audio source is needed
*
* The #cover <img> is also updated with the location of the cover
* art during this call.
*/
const getAudioSource = async (track: Track): Promise<string> => {
  const cover = document.getElementById("cover") as HTMLImageElement

  if ('AlbumFS' in track) { // Local files (no async required)
    const l = track as LocalTrack
    Log(`Setting audio source: ${l.Title}`)

    const imgSrc = `/art/${l.AlbumFS}/${l.AlbumId}`
    setNavigatorMetadata(track, imgSrc)
    cover.src = imgSrc

    return `${Config.serverUrl}/audio/${l.AlbumFS}/${l.AlbumId}`
  } else if ('TrackId' in track) { // YouTube
    const y = track as YtTrack
    Log(`Setting audio source: ${y.Title}`)
    setNavigatorMetadata(track, y.ArtworkUrl)
    cover.src = y.ArtworkUrl

    return (await fetch(`${Config.serverUrl}/yturl/${y.TrackId}`)).text()
  } else {
    Err(`No source available for current track: '${track.Title}'`)
    return ""
  }
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

/**
* Holds the actual <audio> element used to play a track
* and all the buttons for controlling playback
* Alternative helper library:
*  https://github.com/solidjs-community/solid-primitives/tree/main/packages/audio
*/
const Player = (props: {
  track: Track,
  trackCount: number,

  setPlayingIdx: (arg0: number) => any
  playingIdx: number,
}) => {
  let audio: HTMLAudioElement;

  const [volume,setVolume] = createSignal(Config.defaultVolume)
  const [isPlaying,setIsPlaying] = createSignal(true)
  const [currentTime,setCurrentTime] = createSignal(0)

  const [shuffle,setShuffle] = createSignal(false)

  // Update the audio source whenever the track changes
  // `createEffect()` is triggered whenever
  // reactive components inside the function are
  // modified, i.e. `track` in this case.
  createEffect( () => {
    if (props.track !== undefined && props.track.Title != "") {
      getAudioSource(props.track).then(s => { 
        audio.src = s 
      })
    }
  })

  onMount( () => {
    // Initalise the <audio> with the desired default volume
    audio.volume = volume()
  })

  // <Portal> components will be inserted as direct children of the <body>
  // rather than the #root element
  //
  // The #cover needs to exist even when it is not shown so that we can 
  // update the `src` field from `getAudioSource()`
  // <Show when={showCover()} fallback={ <img hidden id="cover"/> }>
  return (<>
    <Portal>
      <img hidden id="cover"/>
    </Portal>

    <audio hidden autoplay preload="auto" ref={audio}
      onTimeUpdate= {() => {
        // Update the `currentTime` every second based on the current time
        // of the <audio> element
        if (audio.currentTime <= props.track.Duration) {
          setCurrentTime(audio.currentTime + 1)
        }
      }}
      onEnded={ () => {
        setNextTrack(props.trackCount, 
          props.setPlayingIdx, props.playingIdx, shuffle()
        )
        setCurrentTime(0)
        setIsPlaying(true)
      }}
    />
    <Portal>
      <nav>
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
          onClick={ () => setShuffle(!shuffle()) }
        />

        <span class="seperator nf nf-indentation-line"/>

        <span role="button"
          class="nf nf-mdi-skip_previous"
          onClick={ () => {
            const prevIndex = TRACK_HISTORY.pop();
            Log("TRACK_HISTORY", TRACK_HISTORY)

            if (prevIndex != null) {
              props.setPlayingIdx(prevIndex)
              setCurrentTime(0)
              setIsPlaying(true)
            }
          }}
        />
        <span role="button"
          class={ isPlaying() ? "nf nf-fa-pause" : "nf nf-fa-play" }
          onClick={ () => {
            if (audio.paused) {
              audio.play()
            } else {
              audio.pause()
            }
            setIsPlaying(!audio.paused)
          }}
        />
        <span role="button"
          class="nf nf-mdi-skip_next"
          onClick={ () => {
            setNextTrack(props.trackCount, 
              props.setPlayingIdx, props.playingIdx, shuffle()
            )
            setCurrentTime(0)
            setIsPlaying(true)
          }}
        />

        <span class="seperator nf nf-indentation-line"/>

        <span>{props.track.Title}</span>

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
        <span class="seperator nf nf-indentation-line"/>

        <span  role="button" class="nf nf-mdi-volume_plus" onClick={() =>
          changeVolume(volume()+Config.volumeStep, audio, setVolume)
        }/>
        <span>{ Math.round(volume()*100) + " %" }</span>
        <span  role="button" class="nf nf-mdi-volume_minus" onClick={() =>
          changeVolume(volume()-Config.volumeStep, audio, setVolume)
        }/>
      </nav>
    </Portal>
  </>);
};

export default Player
