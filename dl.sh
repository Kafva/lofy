#!/usr/bin/env bash
vid=${1:-hpF-WS0lU5A}

yt-dlp -j --extract-audio --skip-download "https://www.youtube.com/watch?v=$vid"|jq -rM '.url'
