import Config, { SHORTCUTS } from './config';

const queryClick = (selector: string) =>
  (document.querySelector(selector) as HTMLSpanElement).click()

/** Click elements under `#shortcuts` based on the configured `SHORTCUTS` object
*/
const handleShortcut = (e:KeyboardEvent) => {
  for (let i=0; i < SHORTCUTS.length; i++){
    if (e.key == SHORTCUTS[i].key){
      queryClick(`#shortcuts > span:nth-child(${i+1})`)
      break;
    }
  }
}

/**
* To preserve reactivity we can NOT change the <audio> element directly,
* we need to do all changes through the reactive API, this can be accomplished
* through virtual keypresses that utilise the functionality in each `onClick`
* Alternative helper library:
*  https://github.com/solidjs-community/solid-primitives/tree/main/packages/keyboard
*/
const HandleKeyboardEvent = (e:KeyboardEvent) => {
  if (e.shiftKey) { // <Shift> bindings
    switch (e.key) {
    case Config.volumeUpKey:
      queryClick("span.nf-mdi-volume_plus")
      break;
    case Config.volumeDownKey:
      queryClick("span.nf-mdi-volume_minus")
      break;
    case Config.previousTrackKey:
      queryClick("span.nf-mdi-skip_previous")
      break;
    case Config.nextTrackKey:
      queryClick("span.nf-mdi-skip_next")
      break;
    case Config.seekBackKey:
      queryClick("span.nf-fa-backward")
      break;
    case Config.seekForwardKey:
      queryClick("span.nf-fa-forward")
      break;
    case Config.shuffleKey:
      queryClick("span.nf-mdi-shuffle_variant,span.nf-mdi-shuffle_disabled")
      break;
    case Config.coverKey:
      queryClick("span.nf-mdi-creation")
      break;
    default:
      handleShortcut(e)
    }
  } else { // Unprefixed bindings
    switch (e.key) {
    case Config.pausePlayKey:
      queryClick("span.nf-fa-pause,span.nf-fa-play")
      break;
    default:
      handleShortcut(e)
    }
  }
}

/** Hook up the media keys to interact with the UI through virtual click events
*/
const SetupMediaHandlers = () => {
  if ('mediaSession' in navigator) {
    navigator.mediaSession.setActionHandler('play', () => {
      queryClick("span.nf-fa-pause,span.nf-fa-play")
    });
    navigator.mediaSession.setActionHandler('pause', () => {
      queryClick("span.nf-fa-pause,span.nf-fa-play")
    });
    navigator.mediaSession.setActionHandler('previoustrack', () => {
      queryClick("span.nf-mdi-skip_previous")
    });
    navigator.mediaSession.setActionHandler('nexttrack', () => {
      queryClick("span.nf-mdi-skip_next")
    });
  }
}

export { HandleKeyboardEvent, SetupMediaHandlers }


