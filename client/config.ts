class Config {
  static server_proto = "http"
  static server_ip = "127.0.0.1";
  static server_port = 20111;
}


// Note: each of the <ul> lists that we want to render 
// already exist in the DOM when we recieve index.html from the server.
// We extract these values to ararys ONCE and not for every re-render
const extract_from_template = (selector: string) => 
  Array.from(document.querySelectorAll(`#${selector} > li`))

const TITLES = { 
 "_playlists":    "Playlists", 
 "_albums":       "Albums", 
 "_yt-playlists": "YouTube" 
}

const LISTS = {
  "_playlists":    extract_from_template("_playlists"),
  "_albums":       extract_from_template("_albums"),
  "_yt-playlists": extract_from_template("_yt-playlists"),
}

const LIST_SELECTORS = Object.keys(LISTS)

export {LISTS, LIST_SELECTORS, TITLES}
export default Config;

