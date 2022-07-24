import { createSignal, splitProps } from 'solid-js';
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

//interface MediaLink {
//  displayName: string;
//  dataUrl: string;
//}


/// The lists need reactivity so that we can keep
/// track of which playlist and which item in a playlist is currently
/// selected and update the UI accordingly
const List = (props: {selector: string, selected: number}) => {
  
  //const [selected,_] = createSignal(selected)
  //const [arr,_] = createSignal(["a","b","c"])

  // Note that we do NOT create a signal for the selector since we
  // do not need it to be reactive
  const arr = Array.from(document.querySelectorAll(`#${props.selector} > li`))

  return (
  <ul> 
    <For each={arr}>{ (item,_) =>
      <li data-id={ item.getAttribute('data-id')}>
        {item.getAttribute('data-name')}
      </li>
    }
    </For>
  </ul>
  );
};

export default List

