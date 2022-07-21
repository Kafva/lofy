package server

const DEBUG = true
const LOG_COLOR = true
const WEBROOT_DIR  = "./dist"

// Playlists are given as `.m3u` files
// Music referenced in a playlist must be under `ALBUM_DIR`
const PLAYLIST_DIR =  "~/Music/.playlists"
const ALBUM_DIR =  "~/Music"
const MAX_ALBUM_CNT = 200;
const MAX_PLAYLIST_CNT = 50;

const PORT = 20111
const ADDR = "127.0.0.1"
const YTDL_BIN = "yt-dlp"

const ALLOWED_GET_PARAM = "(?i)[-_0-9A-Z]{5,20}";
