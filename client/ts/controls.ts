import Config, { SOURCE_SHORTCUTS } from './config';
import appStyles from '../scss/App.module.scss'
import coverStyles from '../scss/Cover.module.scss'

const queryClick = (selector: string) => {
  const span = document.querySelector(selector) as HTMLSpanElement
  if (span !== null){
    span.click()
  } else {
    console.error(`Shortcut target not found: ${selector}`)
  }
}

/** Toggle the visibility of a source list */
const sourceShortcuts = (e:KeyboardEvent) => {
  for (let i=0; i < SOURCE_SHORTCUTS.length; i++){
    if (e.key == SOURCE_SHORTCUTS[i].key){
      const sidebarIdx = SOURCE_SHORTCUTS[i].sourceType
      const sidebarHeaders = document.querySelectorAll(`.${appStyles.sidebar} > h3`)

      if (sidebarIdx < sidebarHeaders.length) {
        (sidebarHeaders[sidebarIdx] as HTMLElement).click()
      } else {
        console.error(`Shortcut sourceType is out of range: ${sidebarIdx}`)
      }
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
    case Config.sidebarScrollDown:
      sideBarScroll(Config.sidebarScrollStepPercent)
      break;
    case Config.sidebarScrollUp:
      sideBarScroll(-1*Config.sidebarScrollStepPercent)
      break;
    default:
      sourceShortcuts(e)
    }
  } else if (e.ctrlKey) {
    switch (e.key) {
    case Config.toggleSidebarKey:
      const selector = `div.${appStyles.sidebar}`
      const sidebar = document
        .querySelector(selector) as HTMLDivElement;
      if (sidebar){
        sidebar.style.visibility = sidebar.style.visibility == 'hidden' ?
          'visible' : 'hidden';
      } else {
        throw `No element found matching '${selector}'`
      }
      break;
    }

  } else { // Unprefixed bindings
    switch (e.key) {
    case Config.pausePlayKey:
      queryClick("span.nf-fa-pause,span.nf-fa-play")
      break;
    case Config.gotoCurrentKey:
      queryClick("span.nf-fae-wind")
      break;
    case Config.exitKey:
      const cover = // Only trigger if the outer <Cover/> div is visible
        document.querySelector(`div.${coverStyles.cover}`) as HTMLDivElement;
      if (cover != null && !cover.hidden) {
        queryClick("span.nf-mdi-creation")
      }
      break;
    case Config.toggleVisualiser:
      queryClick("span.nf-oct-graph")
      break;
    default:
      sourceShortcuts(e)
    }
  }
}

const sideBarScroll = (yPercent: number) => {
  const sidebar = document.querySelector(`.${appStyles.sidebar}`) as HTMLElement
  sidebar.focus()
  sidebar.scrollBy(0,Math.round(yPercent*sidebar.clientHeight))
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


