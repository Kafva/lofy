#!/usr/bin/env bash
# Restart the server whenever changes to source files are detected
find . -name "*.go"|entr -n -s \
  "echo 'Rebuilding...'; pkill -x lofy; go build && ./lofy&"
