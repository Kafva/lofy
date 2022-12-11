package server

type Config struct {
  // Toggle TLS
  USE_TLS bool
  // Bind address
  ADDR string
  // Port to listen on
  PORT int
  // Path to TLS key
  TLS_KEY string
  // Path to TLS certificate
  TLS_CERT string

  // Album directory names cannot exceed 60 characters and cannot
  // contain 'special' characters, see `ALBUM_NAME_REGEX`
  ALBUM_DIR string

  // Local playlists are given as `.m3u` files
  // i.e. a newline seperated list of absolute filepaths.
  // Empty lines and lines with a leading '#' are ignored.
  // Music referenced in a playlist must be under `ALBUM_DIR`
  PLAYLIST_DIR string

  // A file with a list of YouTube playlits/videos on the following format:
  //
  //  SINGLE|MULTI; <Display name>; <Youtube video|playlist ID>
  //
  // Leading and trailing whitespace are ignored
  // YouTube video IDs are taken from the `?v` parameter of
  // a YouTube URL (SINGLE) and playlist IDs are taken from
  // the `?list` parameter (MULTI).
  YT_PLAYLIST_FILE string

  // Toggle debug logging
  DEBUG bool
  // Toggle color in logs
  LOG_COLOR bool

  // Path to `yt-dlp` binary
  YTDL_BIN  string
  // Path to `ffmpeg` binary
  FFMPEG_BIN  string
  // Path to `ffprobe` binary
  FFPROBE_BIN  string
}

func DefaultConfig() Config {
  return Config {
    USE_TLS: true,
    ADDR: "127.0.0.1",
    PORT: 20111,
    TLS_KEY:  "./tls/server.key",
    TLS_CERT: "./tls/server.crt",
    PLAYLIST_DIR:  "~/Music/.playlists",
    ALBUM_DIR:  "~/Music",
    YT_PLAYLIST_FILE: "~/Music/.playlists/yt",

    DEBUG: true,
    LOG_COLOR: true,

    YTDL_BIN: "yt-dlp",
    FFMPEG_BIN: "ffmpeg",
    FFPROBE_BIN: "ffprobe",
  }
}

var CONFIG = DefaultConfig()


//============================================================================//

// The directory with build output of the client relative to the
// working directory of the server
const WEBROOT_DIR = "./dist"

// Local playlists must have this extension to be recognized
const PLAYLIST_EXT  = "m3u"

// Maximum number of YouTube playlists that will be returned to the client
const YT_MAX_PLAYLIST_CNT = 255;

// Maximum number of album directories that will be returned to the client
const MAX_ALBUM_CNT = 255;

// Maximum number of playlist files that will be returned to the client
const MAX_PLAYLIST_CNT = 255;

// Maximum number of tracks for a playlist or album
const MAX_TRACKS = 1024;

// Pagination threshold for track metadata
const ITEMS_PER_REQ = 32;

// Restrict origins that content can be loaded from using
// Content-Security-Policy headers.
var CSP_VALUE =
  "connect-src 'self'; font-src 'self'; img-src 'self' https://*.ytimg.com; media-src 'self' https://*.googlevideo.com;"

// Alternatively, `sddefault.jpg`
const YT_THUMBNAIL_FILENAME = "maxresdefault.jpg"

// YouTube video IDs are assumed to always be 11 characters
const YT_VIDEO_ID_LENGTH = 11

// Allowed characters for:
//    the `<video id>` parameter to `/yturl`
//    the subcommand parameter to `/meta`
//    the `<playlist id>` parameter for `/meta`
const ALLOWED_STRS = "^(?i)[-_0-9A-Z]{1,60}$";

// Allowed characters for album names to:
//    the `<name>` parameter of `/meta`
//    the `<album>` parameter of `/art`
const ALBUM_NAME_REGEX = "^(?i)[ -_0-9A-Z]{1,60}$";

// Codec stream types that will be used to extract cover art
var COVER_CODECS = [...]string{ "png", "mjpeg", "jpeg" }
