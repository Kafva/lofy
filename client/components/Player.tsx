import { createEffect, createSignal, onCleanup, onMount, Setter } from 'solid-js';
import { Portal } from 'solid-js/web';
import Config, { Warn, Log } from '../config';
import { Track, LocalTrack, YtTrack } from '../types';

const queryClick = (selector: string) =>
  (document.querySelector(selector) as HTMLSpanElement).click()

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
* To preserve reactivity we can NOT change the <audio> element directly,
* we need to do all changes through the reactive API, this can be accomplished
* through virtual keypresses that utilise the functionality in each `onClick`
* Alternative helper library:
*  https://github.com/solidjs-community/solid-primitives/tree/main/packages/keyboard
*/
const shortcutHandler = (e:KeyboardEvent) => {
  if (e.shiftKey) { // <Shift> bindings
    switch (e.key) {
    case Config.volumeUpKey:
      queryClick("span.nf-mdi-volume_plus")
      break;
    case Config.volumeDownKey:
      queryClick("span.nf-mdi-volume_minus")
      break;
    case Config.previousTrackKey:
      queryClick("span.nf-mdi-skip_previous")
      break;
    case Config.nextTrackKey:
      queryClick("span.nf-mdi-skip_next")
      break;
    case Config.seekBackKey:
      queryClick("span.nf-fa-backward")
      break;
    case Config.seekForwardKey:
      queryClick("span.nf-fa-forward")
      break;
    case Config.shuffleKey:
      queryClick("span.nf-mdi-shuffle_variant")
      break;
    case Config.coverKey:
      queryClick("span.nf-mdi-music_box")
      break;
    }
  } else { // Unprefixed bindings
    switch (e.key) {
    case Config.pausePlayKey:
      queryClick("span.nf-fa-pause,span.nf-fa-play")
      break;
    }
  }
}

/**
* Hook up the media keys to interact with the UI through virtual click events
*/
const setupMediaHandlers = () => {
  if ('mediaSession' in navigator) {
    navigator.mediaSession.setActionHandler('play', () => { 
      queryClick("span.nf-fa-pause,span.nf-fa-play")
    });
    navigator.mediaSession.setActionHandler('pause', () => { 
      queryClick("span.nf-fa-pause,span.nf-fa-play")
    });
    navigator.mediaSession.setActionHandler('previoustrack', () => { 
      queryClick("span.nf-mdi-skip_previous")
    });
    navigator.mediaSession.setActionHandler('nexttrack', () => { 
      queryClick("span.nf-mdi-skip_next")
    });
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
  playingIdx: number,
  setPlayingIdx: (arg0: number) => any
}) => {
  let audio: HTMLAudioElement;

  const [volume,setVolume] = createSignal(Config.defaultVolume)
  const [isPlaying,setIsPlaying] = createSignal(true)
  const [currentTime,setCurrentTime] = createSignal(0)

  // Update the audio source whenever the track changes
  // `createEffect()` is triggered (to my understanding) whenever
  // reactive components inside the function are
  // modified, i.e. `track` in this case.
  createEffect( () => {
    getAudioSource(props.track).then(s => { 
      audio.src = s 
    })
  })

  onMount( () => {
    // Initalise the <audio> with the desired default volume
    audio.volume = volume()

    // Setup a global keyboard event listener
    window.addEventListener("keydown", shortcutHandler);
    setupMediaHandlers()
  })

  onCleanup( () => {
    // Since we never unload the Player, the clean up function never runs
    Log("Running <Player> clean up")
    window.removeEventListener.bind(window, "keydown", shortcutHandler)
  });

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
        if (props.playingIdx+1 >= props.trackCount) {
          props.setPlayingIdx(0) // Wrap around for last track
        } else {
          props.setPlayingIdx(props.playingIdx+1)
        }
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
        <span role="button" class="nf nf-mdi-shuffle_variant"
          onClick={ () => {
            Log("TODO")
          }}
        />

        <span class="seperator nf nf-indentation-line"/>

        <span role="button"
          class="nf nf-mdi-skip_previous"
          onClick={ () => {
            if (props.playingIdx-1 >= 0) {
              props.setPlayingIdx(props.playingIdx-1)
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
            if (props.playingIdx+1 >= props.trackCount) {
              props.setPlayingIdx(0) // Wrap around for last track
            } else {
              props.setPlayingIdx(props.playingIdx+1)
            }
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
