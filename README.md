# <img width=30px height=30px src="https://i.imgur.com/4OCZymB.png">&nbsp;&nbsp; lofy
A web player for local files and YouTube playlists/videos. 
The server has two core dependencies which must be installed:
* [yt-dlp](https://github.com/yt-dlp/yt-dlp): For fetching metadata from
  YouTube and deriving audio stream URLs.
* [ffmpeg](https://ffmpeg.org/): For parsing metadata of local files.

The client is built with [solidjs](https://www.solidjs.com/).

![](/misc/visuals.gif)

## Setup
Build the frontend
```bash
npm i -g vite pnpm
pnpm install && ./scripts/genfont.sh && vite build
```
The output of the build process is placed under `./dist`.

### Configuration
The server is built and ran with
```bash
go build && ./lofy -c misc/lofy.example.json
```
The configuration file format is described in [server/config.go](/server/config.go)

### Supported audio sources
The application can serve content from three sources:

1. __Local playlists__: Provided as `.m3u` files, i.e. text files with one
   filepath per line, playlists are read from the `PLAYLIST_DIR` directory
   specified in the configuration.
2. __Local albums__: Any directory containing audio files under the configured
   `ALBUM_DIR`. Note that playlists are only allowed to reference files under
   `ALBUM_DIR`.
3. __YouTube__: YouTube playlists (or standalone videos) are configured through
   the `YT_PLAYLIST_FILE`, each line should be semicolon separated:
```
<Display name>  ; <Youtube video|playlist ID>
```

Leading and trailing whitespace in each column is ignored. YouTube video IDs
are taken from the `?v` parameter of a YouTube URL and playlist IDs are taken
from the `?list` parameter.

Configuration options for the client, e.g. custom shortcuts, are specified
directly in the source code of [client/ts/config.ts](/client/ts/config.ts).
Refer to this file for the default keybindings.

## Development
There are a few simple tests for the server but no automated tests for the
client.
```bash
# Run specific test(s)
go test -v --run get_albums ./server
```
For automatic rebuilds of the server and client during development use:
```bash
./scripts/live.sh $config
```

## Using the audio visualiser with YouTube
The `AudioContext` API can break when sources that serve content with a strict
CORS policy, like `*.googlevideo.com`, are used. For the audio visualiser to
work with YouTube therefore requires a workaround that modifies the CORS header
of each response. This can be accomplished using
[mitmproxy](https://github.com/mitmproxy/mitmproxy) and a browser proxy like
[SwitchyOmega](https://github.com/FelisCatus/SwitchyOmega) that supports
"auto-switching".

```bash
pip3.10 install --user mitmproxy
mitmdump --ssl-insecure --listen-host 127.0.0.1 --listen-port 20112 \
  --scripts scripts/cors.py "~d googlevideo.com"
```

This approach has issues for videos longer than ~ 10 minutes.

## Quirks
* Blank spaces in a `m3u` file do _not_ need to be escaped.
* _'~'_ is allowed when specifying paths inside of playlists.
* [Autoplay restrictions](https://developer.mozilla.org/en-US/docs/Web/Media/Autoplay_guide#autoplay_availability)
  will prevent the application from immediately playing tracks in some setups.
* Audio files are expected to have a non-empty `title` in their metadata.
* Browser proxies can prevent YouTube resources from being loaded. To resolve
  this, set `*.googlevideo.com` as an exception that bypasses the proxy.

## Future work
YouTube-dl has support for many other sources and it should not be too
difficult to integrate e.g. Soundcloud.

