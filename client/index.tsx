/* @refresh reload */
import { render } from 'solid-js/web';
import './scss/index.scss';
import App from './components/App';
import { SetupMediaHandlers, HandleKeyboardEvent } from './controls';

// Setup global listeners for keyboard and media key events
window.addEventListener("keydown", HandleKeyboardEvent);
SetupMediaHandlers()

render(() => <App />, document.getElementById('root') as HTMLElement);
