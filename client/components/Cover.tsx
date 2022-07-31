import styles from '../scss/Cover.module.scss';
import { createEffect, onMount } from 'solid-js';
import { Portal } from 'solid-js/web';
import { Track } from '../types';
import { Log, GetHTMLElement } from '../util';

/**
* The `navigator` API generally works even if the `sizes` and `type`
* are set to default values.
* !! NOTE: This API is prone to break if another application that uses !!
* !! the media key API (e.g. Spotify) is open                          !!
*/
const setNavigatorMetadata = (track: Track, imageSrc: string) => {
  navigator.mediaSession.metadata = new MediaMetadata({
    title:  track.Title,
    artist: track.Artist,
    album:  track.Album,
    artwork: [{
      src: imageSrc,
      sizes: "0x0",
      type: "image/png"
    }]
  });
}

const Cover = (props: {
  track: Track,
  coverSource: string,
}) => {
  let img: HTMLImageElement;
  let bkg: HTMLDivElement;

  // `createEffect()` is triggered whenever a reactive component that is called
  // within the body changes, `coverSource` in this case.
  createEffect( () => {
    // Skip updates where the `coverSource` is empty
    if (props.coverSource !== undefined && props.coverSource !== ""){
      Log(`Setting cover background source: '${props.coverSource}'`)
      // Update the navigators metadata
      setNavigatorMetadata(props.track, props.coverSource)
      // The `coverSource()` seems to lose reactivity if it is placed
      // directly in the JSX as  a style
      bkg.setAttribute("style",
        `background-image: url('${props.coverSource}')`
      )
    }
  })

  onMount( () => {
    img      = GetHTMLElement<HTMLImageElement>(`.${styles.cover} > div > img`)
    bkg = GetHTMLElement<HTMLDivElement>(`.${styles.cover} > div:first-child`)
  })

  // <Portal> components will be inserted as direct children of the <body>
  // rather than the #root element
  //
  // The #cover needs to exist even when it is not shown so that we can
  // update the `src` field from `getAudioSource()`
  return (<>
      <span role="button" class="nf nf-mdi-creation"
        onClick={ () => {
          const cover = 
            document.querySelector(`.${styles.cover}`) as HTMLDivElement
          if (cover !== undefined) {
            cover.hidden = !cover.hidden
          }
        }}
      />
      <Portal>
      <div hidden class={styles.cover}>
        <div/>
        <div>
          <img src={props.coverSource} onLoad={()=>{
            // Maintain the original dimensions of images smaller than 600x600
            // and scale down larger images
            img.width  = img.naturalWidth  > 600 ? 600 : img.naturalWidth;
            img.height = img.naturalHeight > 600 ? 600 : img.naturalHeight;
          }}/>
          <p>{props.track.Title} ―  {props.track.Artist}</p>
        </div>
      </div>
      </Portal>
  </>);
};

export default Cover

