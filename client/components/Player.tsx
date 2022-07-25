import { createEffect, createSignal, Setter } from 'solid-js';
import { Portal } from 'solid-js/web';
import Config, { Err, Log } from '../config';
import { Track, LocalTrack, YtTrack } from '../types';

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
    return `${Config.serverUrl}/audio/${l.AlbumFS}/${l.AlbumId}`
  } else if ('TrackId' in track) { // YouTube
    const y = track as YtTrack
    Log(`Setting audio source: ${y.Title}`)
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

  // <audio controls preload="auto" src={ audioUrl() || "" }/>
  let audio: HTMLAudioElement;  //<audio controls preload="auto"/> as HTMLAudioElement;

  // Update the audio source whenever the track changes
  // `createEffect()` is triggered (to my understanding) whenever
  // reactive components inside the function are modified, i.e. track in this case.
  createEffect( () => {
    getAudioSource(props.track).then(s => audio.src = s)
  })

  // TODO: Metadata player API

  // <Portal> components will be inserted as direct children of the <body>
  // rather than the #root element
  return (<>
    <Portal>
      <nav>
        <span role="button" class="nf nf-mdi-menu"/>
        <span role="button" class="nf nf-mdi-music_box"/>
        <span role="button" class="nf nf-mdi-shuffle_variant"/>

        <span class="seperator nf nf-indentation-line"/>
      
        <span role="button" class="nf nf-mdi-skip_previous"/>
        <span role="button" class="nf nf-fa-play"/> 
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

    <audio controls preload="auto" ref={audio}/>
  </>);
};

export default Player
