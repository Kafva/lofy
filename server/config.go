package server

const DEBUG = true
const LOG_COLOR = true
const WEBROOT_DIR  = "./dist"

// Playlists are given as `.m3u` files
// Music referenced in a playlist must be under `ALBUM_DIR`
const PLAYLIST_DIR 	=  "~/Music/.playlists"
const ALBUM_DIR 		=  "~/Music"

// Maximum number of album directories that will be returned to the client
const MAX_ALBUM_CNT = 200;

// Maximum number of playlist files that will be returned to the client
const MAX_PLAYLIST_CNT = 50;

// Maximum number of tracks for a playlist or album
const MAX_TRACKS = 500;

// Pagination threshold for track metadata
const PAGINATION_THRESHOLD = 64;

const PORT = 20111
const ADDR = "127.0.0.1"
const YTDL_BIN = "yt-dlp"

const ALLOWED_GET_PARAM = "(?i)[-_0-9A-Z]{5,20}";
