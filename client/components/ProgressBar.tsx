import styles from '../scss/ProgressBar.module.scss';
import { onMount } from 'solid-js';
import { Track } from '../ts/types';
import { GetHTMLElement } from '../ts/util';

/** Seek in the <audio> based on the X coordinate of a mouse event */
const seekToPercent = (audio:HTMLAudioElement, e:MouseEvent) => {
  if (e.pageX !== undefined) {
    audio.currentTime = (e.pageX / document.body.clientWidth)*audio.duration
  }
}
const ProgressBar = (props: {
  track: Track
  currentTime: number,
}) => {
  let audio: HTMLAudioElement;
  onMount( () => {
    audio     = GetHTMLElement<HTMLAudioElement>("audio")
  })

  return (<>
    <div class={styles.background} 
      onClick={(e:MouseEvent) => seekToPercent(audio,e)}/>
    <div class={styles.fill} 
      onClick={(e:MouseEvent) => seekToPercent(audio,e)}
      style={{
        "width": 
                `${Math.floor(105*(props.currentTime/props.track.Duration))}%`
      }}
    />
  </>);
};

export default ProgressBar

