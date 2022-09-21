import { Portal } from "solid-js/web";
import styles from '../scss/MsgBox.module.scss';
import { GetHTMLElement } from "../util";

const Msg = (text: string, timeout: number) => {
  const msg = GetHTMLElement<HTMLDivElement>(`div.${styles.msgbox}`);
  msg.querySelector('p')!.innerHTML = text;
  msg.style.visibility = 'visible';

  setTimeout(() => msg.style.visibility = 'hidden', timeout);
}

const MsgBox = () =>
  (<Portal>
    <div class={styles.msgbox}  onClick={()=>{{
      const msg = GetHTMLElement<HTMLDivElement>(`div.${styles.msgbox}`);
      msg.style.visibility = 'hidden';
    }}}>
      <p/>
    </div>
  </Portal>);

export { MsgBox, Msg }
