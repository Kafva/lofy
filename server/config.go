package server

const YTDL_BIN = "yt-dlp"
const FFMPEG_BIN = "ffmpeg"
const FFPROBE_BIN = "ffprobe"

const DEBUG = true
const LOG_COLOR = true
const WEBROOT_DIR  = "./dist"

// Local playlists are given as `.m3u` files
// Music referenced in a playlist must be under `ALBUM_DIR`
const PLAYLIST_DIR  =  "~/Music/.playlists"

// List of YouTube playlits on the following format
//	<Display name>; <`list=` value>
// Leading and trailing whitespaces are ignored
const YT_PLAYLIST_FILE = "~/Music/.playlists/yt"
const YT_MAX_PLAYLIST_CNT = 255;

// Album directory names MUST adhear to the regex defined by `ALBUM_NAME_REGEX`
const ALBUM_DIR     =  "~/Music"

// Local playlists must have this extension to be recognized
const PLAYLIST_EXT  = "m3u"

// Maximum number of album directories that will be returned to the client
const MAX_ALBUM_CNT = 200;

// Maximum number of playlist files that will be returned to the client
const MAX_PLAYLIST_CNT = 50;

// Maximum number of tracks for a playlist or album
const MAX_TRACKS = 500;

// Pagination threshold for track metadata
const ITEMS_PER_REQ = 20;

const PORT = 20111
const ADDR = "127.0.0.1"

// Allowed characters for:
//		the `v` paramater to `/yturl`
//		the subcommand parameter to `/meta`
const ALLOWED_STRS = "^(?i)[-_0-9A-Z]{1,20}$";

// Allowed characters for album names to:
//		the `<name>` parameter of `/meta`
//		the `<album>` parameter of `/art`
const ALBUM_NAME_REGEX = "^(?i)[ -_0-9A-Z]{1,20}$";

// Codec stream types that will be used to extract cover art
var COVER_CODECS = [...]string{ "png", "mjpeg", "jpeg" }
