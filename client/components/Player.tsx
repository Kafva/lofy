import { Portal } from 'solid-js/web';
import { Track } from '../types';

/**
 * Holds the actual <audio> element used to play a track
 * and all the buttons for controlling playback
 */
const Player = (props: {
  track: Track,
  playingIdx: number,
  setPlayingIdx: (arg0: number) => any
}) => {
  // <Portal> components will be inserted as direct children of the <body>
  // rather than the #root element
  return (
    <Portal>
      <div id="bar">
        <span class="nf nf-mdi-menu" />
        <span class="nf nf-mdi-music_box" />
        <span class="nf nf-mdi-shuffle_variant" />

        <span class="seperator nf nf-indentation-line" />
      
        <span class="nf nf-mdi-skip_previous" />
        <span class="nf nf-fa-play" /> 
        <span class="nf nf-mdi-skip_next" />
      
        <span class="seperator nf nf-indentation-line" />
      
        <span  id="currentTrack"> { props.track.Title } </span> 
        <span  class="nf nf-fa-backward" />
        <span  id="progress"> { "0 / " + props.track.Duration + " s" } </span>
        <span  class="nf nf-fa-forward" />

        <span class="seperator nf nf-indentation-line" />

        <span  class="nf nf-mdi-volume_plus" /> 
        <span  id="volume"> % </span>
        <span  class="nf nf-mdi-volume_minus" />
      </div>
    </Portal>
  );
};

export default Player
