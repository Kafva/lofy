package server

const USE_TLS = true
const ADDR = "127.0.0.1"
const PORT = 20111
const TLS_KEY =  "./tls/server.key"
const TLS_CERT = "./tls/server.crt"

// Local playlists are given as `.m3u` files
// Music referenced in a playlist must be under `ALBUM_DIR`
const PLAYLIST_DIR  =  "~/Music/.playlists"
// Album directory names MUST adhear to the regex defined by `ALBUM_NAME_REGEX`
const ALBUM_DIR     =  "~/Music"

// List of YouTube playlits on the following format
//	<Display name>; <`list=` value>
// Leading and trailing whitespaces are ignored
const YT_PLAYLIST_FILE = "~/Music/.playlists/yt"

const DEBUG = true
const LOG_COLOR = true

//============================================================================//

// Restrict origins that content can be loaded from (Content-Security-Policy)
var CSP_VALUES = [...]string{
	"connect-src 'self';",
	"font-src 'self';",
	"img-src 'self' https://*.ytimg.com;",
	"media-src 'self' https://*.googlevideo.com;",
}

const YTDL_BIN = "yt-dlp"
const FFMPEG_BIN = "ffmpeg"
const FFPROBE_BIN = "ffprobe"

const WEBROOT_DIR  = "./dist"

const YT_MAX_PLAYLIST_CNT = 255;

// Alternatively, `sddefault.jpg`
const YT_THUMBNAIL_FILENAME = "maxresdefault.jpg"

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

const SINGLE_YT_TRACK = "SINGLE"

// Allowed characters for:
//		the `<video id>` paramater to `/yturl`
//		the subcommand parameter to `/meta`
//		the `<playlist id>` parameter for `/meta`
const ALLOWED_STRS = "^(?i)[-_0-9A-Z]{1,50}$";

// Allowed characters for album names to:
//		the `<name>` parameter of `/meta`
//		the `<album>` parameter of `/art`
const ALBUM_NAME_REGEX = "^(?i)[ -_0-9A-Z]{1,40}$";

// Codec stream types that will be used to extract cover art
var COVER_CODECS = [...]string{ "png", "mjpeg", "jpeg" }
