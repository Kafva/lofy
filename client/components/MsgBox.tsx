import { Portal } from "solid-js/web";
import styles from '../scss/MsgBox.module.scss';
import { GetHTMLElement } from "../ts/util";

/** Update the message text and unhide the box */
const Msg = (text: string, iconClass: string, timeout: number) => {
    const msg = GetHTMLElement<HTMLDivElement>(`div.${styles.msgbox}`);
    const span = msg.querySelector('span');
  msg.querySelector('p')!.innerHTML = text;

  // Clear any previous classes
  span!.className = 'nf'
  span!.classList.add(iconClass)

  msg.classList.add(styles.appear); // Trigger CSS transition

  setTimeout(() => {
      msg.classList.remove(styles.appear);
  }, timeout);
}

const MsgBox = () =>
    (<Portal>
        <div class={styles.msgbox}  onClick={()=>{{
            const msg = GetHTMLElement<HTMLDivElement>(`div.${styles.msgbox}`);
            msg.classList.remove(styles.appear);
        }}}>
            <span class="nf"/><p/>
        </div>
    </Portal>);

export { MsgBox, Msg }
