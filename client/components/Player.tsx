import { createSignal, Setter } from 'solid-js';
import { Portal } from 'solid-js/web';
import Config, { Err } from '../config';
import { Track, LocalTrack, YtTrack } from '../types';

const getAudioSource = async (track: Track): Promise<string> => {
  if ('AlbumFS' in track) { // Local files
    const localTrack = track as LocalTrack
    (await fetch(
      `${Config.serverUrl}/audio/${localTrack.AlbumFS}/${localTrack.AlbumId}`))
      .text()

  //  } else if ('AudioUrl' in track) { // YouTube
  //    (await fetch(`${Config.serverUrl}/yturl?v=${track.Album}`)).text()
  //
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


  // TODO: Metadata player API

  // The source for the audio element can be determined for local resources
  // using the `Track.AlbumFS` and `Track.AlbumId` attributes.
  //
  // For YouTube resources a request to the server 
  // that deteremine the audio source is needed

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

    <audio controls preload="auto" src="???"/>
    
  </>);
};

export default Player
