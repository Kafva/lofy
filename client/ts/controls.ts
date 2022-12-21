import appStyles from '../scss/App.module.scss'
import coverStyles from '../scss/Cover.module.scss'
import Config from './config'

const queryClick = (selector: string) => {
    const span = document.querySelector(selector) as HTMLSpanElement
    if (span !== null){
        span.click()
    } else {
        console.error(`Shortcut target not found: ${selector}`)
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
    // Do not trigger shortcuts when writing inside of an <input/>
    if ((e.target as HTMLElement).tagName == "input") {
        return
    }
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
        case Config.sidebarScrollDownKey:
            sideBarScroll(Config.sidebarScrollStepPercent)
            break;
        case Config.sidebarScrollUpKey:
            sideBarScroll(-1*Config.sidebarScrollStepPercent)
            break;
        case Config.singleRepeatKey:
            queryClick("span.nf-mdi-repeat,span.nf-mdi-repeat_once")
            break;
        case Config.listSearchKey:
            // Implcitly unhide the sidebar
            (document.querySelector("."+appStyles.sidebar) as HTMLDivElement)
                ?.classList.remove(appStyles.hidden)

            const input = document.querySelector('input')
            if (input) {
                e.preventDefault()
                input.focus();
            }
            break;
        }
    } else if (e.ctrlKey) {
        switch (e.key) {
        case Config.toggleSidebarKey:
            const sidebar = document.querySelector("."+appStyles.sidebar) as HTMLDivElement;
            if (sidebar) {
                // The 'hidden' class will change the width and padding,
                // applying the width transition.
                if (sidebar.classList.contains(appStyles.hidden)) {
                    sidebar.classList.remove(appStyles.hidden)
                } else {
                    sidebar.classList.add(appStyles.hidden)
                }
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
        case Config.collapseKey:
            collapseLists()
            break;
        }
    }
}

const sideBarScroll = (yPercent: number) => {
    const sidebar = document.querySelector(`.${appStyles.sidebar}`) as HTMLElement
    sidebar.scrollBy(0,Math.round(yPercent*sidebar.clientHeight))
    // Do not keep focus on the bar, regular j/k in Vimium will start
    // interacting with this otherwisea.
    sidebar.blur()
}

const collapseLists = () => {
    const openLists: boolean[] = []
    const headers = document.querySelectorAll(`.${appStyles.sidebar} > h3`)
    headers.forEach(e => {
        const sibling = e.nextSibling as HTMLElement
        openLists.push(sibling?.tagName.toLowerCase() == 'ul')
    })

    // Open all lists if all are closed
    if (openLists.every(l => !l)  ) {
        headers.forEach( (el) => (el as HTMLElement).click())
    }
    // Close all lists if at least one is open
    else {
        headers.forEach( (el,i) => {
            if (openLists[i]) {
                (el as HTMLElement).click()
            }
        })
    }
}

/** Hook up the media keys to interact with the UI through virtual click events */
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


