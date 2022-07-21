import { createResource, splitProps } from 'solid-js';
import Config from './config'

const get_yt_url = async (video_id:string) =>
  (await fetch(
    `${Config.server_proto}://${Config.server_ip}:${Config.server_port}`+
    `/url?v=${video_id}`)
  ).text()


const Current  = (props: {video_id: string}) => {
  const [ local ] = splitProps(props, ["video_id"]);
  const [yt_url]    = createResource(local.video_id, get_yt_url)

  return (<audio controls src={ yt_url() || "" }> </audio>);
};

export default Current
