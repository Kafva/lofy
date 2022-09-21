#!/usr/bin/env bash
# Restart the server whenever changes to source files are detected
die(){ printf "$1\n" >&2 ; exit 1; }
[ -z "$1" ] && die "usage: $(basename $0) <config.json>"

find . \
  -path ./dist -prune -o \
  -path ./node_modules -prune -o \
  -name "*.go" -o -name "*.ts" -o -name "*.tsx" -o -name "*.html" -o \
  -name "*.scss" |entr -n -s \
  "echo 'Rebuilding...'; pkill -x lofy; rm -rf dist && vite build &&
   go build && ./lofy -c $1 &"
