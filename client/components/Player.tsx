import { createEffect, createSignal, onCleanup, onMount, Setter } from 'solid-js';
import { Portal } from 'solid-js/web';
import Config, { Err, Log } from '../config';
import { Track, LocalTrack, YtTrack } from '../types';

/**
* The `navigator` API generally works even if the `sizes` and `type`
* are set to default values.
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
      //sizes: `${props.track.cover.width || 0}x${props.track.cover.height || 0}`,
      //type: `image/${props.track.cover.type || 'png'}`
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
    Err(`No source available for current track: '${track.Title}'`)
    return ""
  }
}

const changeVolume = (
  newVolume: number,
  audio: HTMLAudioElement,
  setVolume: (arg0: number) => Setter<number>) => {
  if (0 <= newVolume && newVolume <= 1) {
    setVolume(newVolume)
    audio.volume = newVolume
  }
}

const queryClick = (selector: string) => 
  (document.querySelector(selector) as HTMLSpanElement).click()

/**
 * To preserve reactivity we can NOT change the <audio> element directly,
 * we need to do all changes through the reactive API, this can be accomplished 
 * through virtual keypresses that utilise the functionality in each `onClick`
 * Alternative helper library:
 *  https://github.com/solidjs-community/solid-primitives/tree/main/packages/keyboard
 */
const shortcutHandler = (e:KeyboardEvent) => {
  Log(e);
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
  // Alternati
  let audio: HTMLAudioElement;

  const [volume,setVolume] = createSignal(Config.defaultVolume)
  const [isPlaying,setIsPlaying] = createSignal(false)
  const [currentTime,setCurrentTime] = createSignal(0)


  // Update the `currentTime` every second based on the current time
  // of the <audio> element
  const trackProgression = setInterval(() => {
    if (audio !== undefined) {
      setCurrentTime(audio.currentTime + 1), 1000
    }
  });

  // Update the audio source whenever the track changes
  // `createEffect()` is triggered (to my understanding) whenever
  // reactive components inside the function are modified, i.e. `track` in this case.
  createEffect( () => {
    //const audio = document.querySelector("audio") as HTMLAudioElement
    getAudioSource(props.track).then(s => audio.src = s)
  })

  // Setup a global keyboard event listener
  window.addEventListener("keydown", shortcutHandler);

  // Initalise the <audio> with the desired default volume
  onMount( () => {
    audio.volume = volume()
  })

  onCleanup( () => { 
    // Since we never unload the Player, the clean up function never runs
    Log("Running <Player> clean up")
    window.removeEventListener.bind(window, "keydown", shortcutHandler)
    clearInterval(trackProgression)
  });


  // Audio control...
  //  https://github.com/solidjs-community/solid-primitives

  // <Portal> components will be inserted as direct children of the <body>
  // rather than the #root element
  return (<>
    <audio autoplay controls preload="auto" ref={audio}/>

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
              props.setPlayingIdx(props.playingIdx+1)
              setCurrentTime(0)
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
        <span>{`${Math.round(currentTime())} / ${props.track.Duration}`}</span>
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
