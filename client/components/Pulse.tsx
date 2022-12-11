import styles from '../scss/Pulse.module.scss';
import { onMount } from 'solid-js';
import { GetHTMLElement, Log } from '../ts/util';

const SAMPLES_PER_BAR = 2**5
const BAR_WIDTH  = 0.9*SAMPLES_PER_BAR;
const FPS = 40;

const makeEven = (a:number) => a % 2 == 0 ? a : Math.max(a - 1, 0);

const Pulse = () => {
  let audio: HTMLAudioElement;
  let audioCtx: AudioContext;
  let srcNode: MediaElementAudioSourceNode;
  let analyser: AnalyserNode;
  let frequencyData: Uint8Array;
  let canvas: HTMLCanvasElement;
  let canvasCtx: CanvasRenderingContext2D;
  let frequencyCnt: number;
  let lastDrawMS: number;
  let lastCompletedMS: number;
  let drawnFrames: number;

  const draw = (now: DOMHighResTimeStamp) => {
    if (analyser) {
      // Example:
      // 5 FPS ~ 5/1000 frames per millisecond
      // To render at 5 FPS we need to draw 5 frames over 1000 ms
      //
      // I.e. we need to re-draw every 200th (1000/5) milliseconds
      if (now >= (lastDrawMS + (1000/FPS))) {
        // Note: the array will be zeroed out if the audio is muted.
        // The array will contain 1024 values [0-255], each index
        // represents the decibel value for a specific Hz value
        // The frequencies are spread linerarly from
        //  0 Hz to [sample rate / 2] Hz
        //
        // The <canvas> will visualise these values with bars of differing HEIGHT
        analyser.getByteFrequencyData(frequencyData)
        canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
        canvasCtx.fillStyle = styles.white;

        for (let i = SAMPLES_PER_BAR; i < frequencyData.length; i+=SAMPLES_PER_BAR) {
          // We could use the average across the relevant samples but the overhead
          // of a more precise result is not neccessary for our use case
          const barHeight = Math.floor(frequencyData[i]/255 * canvas.height)/2

          canvasCtx.fillRect(i, 0.5*canvas.height, BAR_WIDTH, barHeight);

          // Mirror image
          canvasCtx.fillRect(canvas.width - i, 0.5*canvas.height, BAR_WIDTH, -1*barHeight);
        }
        lastDrawMS = performance.now()
        drawnFrames++;
        if (drawnFrames == FPS) {
          Log(`Done drawing ${FPS} frames: ${(lastDrawMS - lastCompletedMS) / 1000} sec`)
          drawnFrames = 0;
          lastCompletedMS = lastDrawMS;
        }
      }
    }
    requestAnimationFrame(draw)
  }

  onMount(() => {
    audio = GetHTMLElement<HTMLAudioElement>("audio")
    audio.crossOrigin = "anonymous"
    // https://developer.mozilla.org/en-US/docs/Web/API/AudioNode
    // Source nodes:      0  inputs, 1+ outputs
    // Destination nodes: 1+ inputs, 0  outputs
    // Analyser nodes:    1+ inputs, 1+ outputs
    //
    // Connect the OUTPUT of `node1` to the INPUT of `node2`
    // node1.connect(node2)

    // Initialise audio context for sound visualisation
    audioCtx = new window.AudioContext();

    // Create a SRC node (1 output no input) for the <audio>
    srcNode = audioCtx.createMediaElementSource(audio)

    // Create an analyser which can read the frequency data of the node
    //  maxDecibels: -30
    //  minDecibels: -100
    analyser     =  audioCtx.createAnalyser();
    frequencyCnt =  analyser.frequencyBinCount

    frequencyData = new Uint8Array(frequencyCnt)

    // Set the OUTPUT of the `srcNode` to the INPUT of the analyser...
    srcNode.connect(analyser)
    // ...and set the OUTPUT of the analyzer to be the INPUT for
    // the audio context destination
    analyser.connect(audioCtx.destination)

    canvasCtx = canvas.getContext("2d")!;

    lastCompletedMS = lastDrawMS = performance.now();
    drawnFrames = 0;

    draw(lastDrawMS);
  })

  return <canvas
    ref={canvas!}
    width={makeEven(document.documentElement.clientWidth)}
    height={makeEven(0.9*document.documentElement.clientHeight)}
  />;
};

export default Pulse
