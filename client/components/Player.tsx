import { createEffect, createSignal, Setter } from 'solid-js';
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
  setVolume: (arg0: number) => Setter<number>) => {
  if (0 <= newVolume && newVolume <= 1) {
    setVolume(newVolume)
  }
}

/**
 * Holds the actual <audio> element used to play a track
 * and all the buttons for controlling playback
 */
const Player = (props: {
  track: Track,
  playingIdx: number,
  setPlayingIdx: (arg0: number) => any
}) => {
  const [volume,setVolume] = createSignal(Config.defaultVolume)
  let audio: HTMLAudioElement; //= <audio/> as HTMLAudioElement;

  // Update the audio source whenever the track changes
  // `createEffect()` is triggered (to my understanding) whenever
  // reactive components inside the function are modified, i.e. track in this case.
  createEffect( () => {
    //const audio = document.querySelector("audio") as HTMLAudioElement
    getAudioSource(props.track).then(s => audio.src = s)
  })

  // Audio control...
  //  https://github.com/solidjs-community/solid-primitives

  // <Portal> components will be inserted as direct children of the <body>
  // rather than the #root element
  return (<>
    <audio controls preload="auto" ref={audio}/>

    <Portal>
      <nav>
        <span role="button" class="nf nf-mdi-menu"/>
        <span role="button" class="nf nf-mdi-music_box"/>
        <span role="button" class="nf nf-mdi-shuffle_variant"/>

        <span class="seperator nf nf-indentation-line"/>

        <span role="button" class="nf nf-mdi-skip_previous"/>
        <span role="button"
          class={ audio.paused ? "nf nf-fa-play" : "nf nf-fa-pause" }
          onClick={ () => {
            //class="nf nf-fa-play"
            //const audio = document.querySelector("audio") as HTMLAudioElement
            if (audio.paused) {
              audio.play()
            } else {
              audio.pause()
            }
          }}/>
        <span role="button" class="nf nf-mdi-skip_next"/>

        <span class="seperator nf nf-indentation-line"/>

        <span>{ props.track.Title }</span>

        <span  role="button" class="nf nf-fa-backward"/>
        <span> { "0 / " + props.track.Duration + " s" } </span>
        <span  role="button" class="nf nf-fa-forward"/>

        <span class="seperator nf nf-indentation-line"/>

        <span  role="button" class="nf nf-mdi-volume_plus" onClick={() =>
          changeVolume(volume()+Config.volumeStep, setVolume)
        }/>
        <span>{ Math.round(volume()*100) + " %" }</span>
        <span  role="button" class="nf nf-mdi-volume_minus" onClick={() =>
          changeVolume(volume()-Config.volumeStep, setVolume)
        }/>
      </nav>
    </Portal>
  </>);
};

export default Player
