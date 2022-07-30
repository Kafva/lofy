# <img width=30px height=30px src="https://i.imgur.com/4OCZymB.png">&nbsp;&nbsp; lofy
This project provides a basic web player for local files and YouTube playlists. 
The server is written in Go and has two core dependencies:
* [yt-dlp](https://github.com/yt-dlp/yt-dlp): For fetching metadata from YouTube and deriving URLs for the actual audio streams.
* [ffmpeg](https://ffmpeg.org/): For parsing metadata of local files.

The client is powered by [solidjs](https://www.solidjs.com/).

## Setup
Build the frontend
```bash
npm i -g vite pnpm
pnpm install && vite build
```
The output of the build process is placed under `./dist`.

### Configuration
The server is built and ran with
```bash
go build && ./lofy -c lofy.json
```
The configuration file format is described in `./server/config.go`.

Configuration options for the client, e.g. custom shortcuts, are specified 
directly in the source code of `./client/config.ts`.


## Development
There are a few simple tests for the server but no automated tests for the 
client.
```bash
# Run specific test(s)
go test -v --run get_albums ./server
```
For automatic rebuilds of the server and client during development use:
```bash
./live.sh
vite build --watch
```

## Future work
Youtube-dl has support for many other sources and it should not be to difficult
to integrate e.g. Soundcloud.

