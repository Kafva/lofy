/* @refresh reload */
import { render } from 'solid-js/web';
import './scss/index.scss';
import App from './components/App';

render(() => <App />, document.getElementById('root') as HTMLElement);
