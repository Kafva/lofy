#!/usr/bin/env bash
# Restart the server whenever changes to source files are detected
find . -name "*.go"|entr -n -s \
  "echo 'Rebuilding...'; pkill lofy; go build && ./lofy 2>&1|sed '/compiled command/d' &"
