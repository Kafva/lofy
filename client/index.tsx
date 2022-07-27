/* @refresh reload */
import { render } from 'solid-js/web';
import './scss/index.scss';
import App from './components/App';
import { Log, PLAYLIST_ORDER } from './config';


Log("Loaded playlist order: ", PLAYLIST_ORDER)

render(() => <App />, document.getElementById('root') as HTMLElement);
