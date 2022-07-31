import './scss/index.scss';
import { render } from 'solid-js/web';
import { SetupMediaHandlers, HandleKeyboardEvent } from './controls';
import App from './components/App';

// Setup global listeners for keyboard and media key events
window.addEventListener("keydown", HandleKeyboardEvent);
SetupMediaHandlers()

render(() => <App />, document.getElementById('root') as HTMLElement);
