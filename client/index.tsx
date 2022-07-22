/* @refresh reload */
import { render } from 'solid-js/web';
import App from './App';


window.onload = () => {
  let webSocket = new WebSocket("ws://localhost:20111/ws");

  webSocket.onopen = (_:Event) => {
    console.log("Open connection")
  };

  webSocket.onmessage = (e:Event) => {
    console.log("Got message: ", e.data)
  }
}



render(() => <App />, document.getElementById('root') as HTMLElement);
