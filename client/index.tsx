import './scss/index.scss';
import { render } from 'solid-js/web';
import { SetupMediaHandlers, HandleKeyboardEvent } from './controls';
import App from './components/App';

// Setup global listeners for keyboard and media key events
window.addEventListener("keydown", HandleKeyboardEvent);
SetupMediaHandlers()

render(() => <App/>, document.getElementById('root') as HTMLElement);

// Using a Uint8Array for the frequency data requires the min/max decibel
// value to be in a sane range, otherwise everything is zeroed out.
//  https://stackoverflow.com/a/14678000/9033629
let analyser: AnalyserNode;
let frequencyData: Float32Array;

// https://developer.mozilla.org/en-US/docs/Web/API/AudioNode
// Source nodes:      0  inputs, 1+ outputs
// Destination nodes: 1+ inputs, 0  outputs
// Analyser nodes:    1+ inputs, 1+ outputs
//
// Connect the OUTPUT of `node1` to the INPUT of `node2`
// node1.connect(node2)
let srcNode: AudioNode;

window.onload = () => {
  setTimeout(()=>{
    // Initialise audio context for sound visualisation
    const audioCtx = new window.AudioContext();
    const audio = document.querySelector('audio');
    
    // Create a SRC node (1 output no input) for the <audio>
    srcNode = audioCtx.createMediaElementSource(audio!)

    // Create an analyser which can read the frequency data of the node
    analyser = audioCtx.createAnalyser();
    frequencyData = new Float32Array(analyser.frequencyBinCount)

    // Set the OUTPUT of the `srcNode` to the INPUT of the analyser...
    srcNode.connect(analyser)
    // ...and set the OUTPUT of the analyzer to be the INPUT for 
    // the audio context destination
    analyser.connect(audioCtx.destination)


    console.log("Created context for", audio!.src)
  }, 4000)
}

setInterval( () => {
  if (analyser) {
    analyser.getFloatFrequencyData(frequencyData)
    console.log("AAAAAAAA", frequencyData)
  }
}, 4000)
