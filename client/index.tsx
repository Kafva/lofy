/* @refresh reload */
import { render } from 'solid-js/web';
import './scss/index.scss';
import App from './components/App';
import { SetupMediaHandlers, HandleKeyboardEvent } from './controls';

// The `import.meta.url` argument is needed to create the name 
// of the compiled version of `worker.js`
const worker = new Worker(new URL('./worker.ts', import.meta.url))

worker.onmessage = function(e) {
  console.log('Message received from worker', e.data);
}

setTimeout( () => {
  (()=>{
    console.log('Message posted to worker');
    worker.postMessage([5, 5]);
  })()
}, 2000)



// Setup global listeners for keyboard and media key events
window.addEventListener("keydown", HandleKeyboardEvent);
SetupMediaHandlers()

render(() => <App />, document.getElementById('root') as HTMLElement);
