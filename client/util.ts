import { DEBUG, MEDIA_LISTS } from "./config"
import { PlaylistEntry, MediaListType } from './types';


const DisplayTime = (seconds: number): string => {
  const min =  Math.floor(seconds/60).toString().padStart(2,"0")
  const sec =  Math.floor(seconds%60).toString().padStart(2,"0")
  return `${min}:${sec}`
}

const ExtractPlaylistOrderFromTemplate = (): Map<string,PlaylistEntry[]> => {
  const order = new Map<string,PlaylistEntry[]>()

  MEDIA_LISTS[MediaListType.LocalPlaylist].map((p:HTMLLIElement)=>p.innerHTML)
    .forEach( (pls:string) => {
      // The order of items in the `items` array corresponds to the
      // order of the m3u playlist
      const items = document.querySelectorAll(`ul[data-name='${pls}'] > li`)

      order.set(pls, <PlaylistEntry[]>[])

      for (const li of items) {
        const split = li.innerHTML.split(":")
        order.get(pls)!.push({
          AlbumFS: split[0] as string,
          AlbumId: parseInt(split[1] as string)
        } as PlaylistEntry)
      }
    })
  return order
}

const ExtractListsFromTemplate = (selector: string): HTMLLIElement[] =>
  Array.from(document.querySelectorAll(`#${selector} > li`))

const Log = (...args: any) => {
  if (DEBUG) {
    console.log("%c DEBUG ", 'background: #2b71e0; color: #f5e4f3', ...args)
  }
}
const Err = (...args: any) => {
  console.log("%c ERROR ", 'background: #ed493e; color: #f5e4f3', ...args)
}
const Warn = (...args: any) => {
  console.log("%c WARN ", 'background: #dbba00; color: #ffffff', ...args)
}

export { 
  Log, Err, Warn, 
  ExtractListsFromTemplate, ExtractPlaylistOrderFromTemplate, DisplayTime
}
