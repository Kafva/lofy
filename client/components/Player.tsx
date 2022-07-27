import { createEffect, createSignal, onMount, Setter, untrack } from 'solid-js';
import { Portal } from 'solid-js/web';
import Config, { Warn, Log } from '../config';
import { Track, LocalTrack, YtTrack } from '../types';

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
*/
const getAudioSource = async (track: Track): Promise<string> => {
  if ('AlbumFS' in track) { // Local files (no async required)
    const l = track as LocalTrack
    Log(`Setting audio source: ${l.Title}`)
    setNavigatorMetadata(track, `/art/${l.AlbumFS}/${l.AlbumId}`)

    return `${Config.serverUrl}/audio/${l.AlbumFS}/${l.AlbumId}`
  } else if ('TrackId' in track) { // YouTube
    const y = track as YtTrack
    Log(`Setting audio source: ${y.Title}`)
    setNavigatorMetadata(track, y.ArtworkUrl)

    return (await fetch(`${Config.serverUrl}/yturl/${y.TrackId}`)).text()
  } else {
    Warn(`No source available for current track: '${track.Title}'`)
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

  setTrackHistory: (arg0: number[]) => any,
  trackHistory: number[],

  shuffle: boolean,
) => {
  let newIndex: number
  if (shuffle && trackCount>1) {
    // If all songs in the playlist have been played,
    // Clear the history
    if (trackCount == trackHistory.length) {
      setTrackHistory([])
    }
    do  {
      newIndex = Math.floor(trackCount*Math.random())
      // Pick a new index if there is an overlap with the current track or
      // the history.
    } while (newIndex == playingIdx || trackHistory.indexOf(newIndex) != -1)
    Log("Setting random index: ", newIndex)
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

  setTrackHistory: (arg0: number[]) => any,
  trackHistory: number[],

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
  return (<>
    <audio hidden autoplay preload="auto" ref={audio}
      onTimeUpdate= {() => {
        // Update the `currentTime` every second based on the current time
        // of the <audio> element
        if (audio.currentTime <= props.track.Duration) {
          setCurrentTime(audio.currentTime + 1)
        }
      }}
      onEnded={ () => {

        untrack( () => {
          props.setTrackHistory([...props.trackHistory, props.playingIdx])
          Log("HISTORY", props.trackHistory)
        })

        setNextTrack(props.trackCount, 
          props.setPlayingIdx, props.playingIdx,
          props.setTrackHistory, props.trackHistory, shuffle()
        )
        setCurrentTime(0)
        setIsPlaying(true)
      }}
    />
    <Portal>
      <nav>
        <span role="button" class="nf nf-mdi-music_box"
          onClick={ () => {
            Log("TODO")
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
            const prevIndex = props.trackHistory[-1]
            untrack( () => {
              props.setTrackHistory( props.trackHistory.splice(-1)  )
              Log("HISTORY", props.trackHistory)
            })

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
            untrack( () => {
              props.setTrackHistory([...props.trackHistory, props.playingIdx])
              Log("HISTORY", props.trackHistory)
            })

            setNextTrack(props.trackCount, 
              props.setPlayingIdx, props.playingIdx,
              props.setTrackHistory, props.trackHistory, shuffle()
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
        <span>{`${Math.floor(currentTime())} / ${props.track.Duration}`}</span>
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
