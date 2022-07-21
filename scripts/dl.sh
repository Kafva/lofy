#!/usr/bin/env bash
vid=${1:-hpF-WS0lU5A}
yt-dlp -j  --format bestaudio --extract-audio --skip-download \
  "https://www.youtube.com/watch?v=$vid"|jq

