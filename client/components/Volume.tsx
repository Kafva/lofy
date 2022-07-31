import { onMount, Setter } from 'solid-js';
import Config from '../config';
import { GetHTMLElement } from '../util';

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

const Volume = (props: {
  setVolume: (arg0: number) => any,
  volume: number
}) => {
  let audio: HTMLAudioElement;
  onMount( () => {
    audio     = GetHTMLElement<HTMLAudioElement>("audio")
  })

  return (<>
    <span  role="button" class="nf nf-mdi-volume_plus" onClick={() =>
      changeVolume(props.volume+Config.volumeStep, audio, props.setVolume)
    }/>
    <span>{ Math.round(props.volume*100) + " %" }</span>
    <span  role="button" class="nf nf-mdi-volume_minus" onClick={() =>
      changeVolume(props.volume-Config.volumeStep, audio, props.setVolume)
    }/>
  </>);
};

export default Volume
