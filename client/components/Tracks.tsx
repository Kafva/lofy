import { createEffect } from 'solid-js';
import { MediaListType, MEDIA_LISTS } from '../config';

import { LocalTrack } from '../types';

const fetchMediaList = async (name: string, typing: MediaListType) => {
    const baseUrl = 
      `${Config.serverProto}://${Config.serverIp}:${Config.serverPort}/`

    switch (typing) {
      case MediaListType.LocalPlaylist:
        const data = await (await fetch(`${baseUrl}/meta/playlist/${name}`)).json()
        console.log(data)
        break;
      case MediaListType.LocalAlbum:
        break;
      case MediaListType.YouTube:
        break;
    }

    return "wow"
}


/**
* The `Tracks` component will fetch Tracks from the server
* based on a provided the currently selected item
*/
const Tracks = (props: {
  activeList: MediaListType,

  selected: number,
  setSelected: (arg0: number) => any,
}) => {
  

  return (<>
    <p>{ "Current tracks: "+ props.activeList+" "+props.selected }</p>
    <p> { fetchMediaList( MEDIA_LISTS[props.activeList][props.selected].innerHTML,  props.activeList ) } </p>
  </>);
};

export default Tracks
