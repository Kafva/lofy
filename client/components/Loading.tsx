import { Portal } from 'solid-js/web';
import style from '../scss/Loading.module.scss';

const Loading = () =>
    <Portal>
        <div class={style.loading}>
            <span/>
            <span/>

            <span/>

            <span/>
            <span/>
        </div>
    </Portal>

export default Loading

