import { createResource, splitProps } from 'solid-js';
import Config from '../config'

const getYtUrl = async (videoId:string) =>
  (await fetch(
    `${Config.serverProto}://${Config.serverIp}:${Config.serverPort}`+
    `/yturl?v=${videoId}`)
  ).text()


const Current  = (props: {videoId: string}) => {
  const [local]     = splitProps(props, ["videoId"]);
  const [ytUrl]    = createResource(local.videoId, getYtUrl)

  return (<audio controls src={ ytUrl() || "" }> </audio>);
};

export default Current
