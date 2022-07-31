#!/usr/bin/env bash
# Restart the server whenever changes to source files are detected
die(){ printf "$1\n" >&2 ; exit 1; }
[ -z "$1" ] && die "usage: $(basename $0) <config.json>"

find . -name "*.go"|entr -n -s \
  "echo 'Rebuilding...'; pkill -x lofy; go build && ./lofy -c $1&"
