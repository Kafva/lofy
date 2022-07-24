import { createResource, splitProps } from 'solid-js';
//import Config from './config'


//class MediaLink {
//  public displayName: string;
//  public href: string;
//
//  constructor(displayName: string, href: string){
//    this.displayName = displayName;
//    this.href = href;
//  }
//}

interface MediaLink {
  displayName: string;
  dataUrl: string;
}


const List  = (props: {items: MediaLink[]}) => {
  
  

  //<For each={items} =>
  return (
  <ul> 
  </ul>
  );
};

export default List

