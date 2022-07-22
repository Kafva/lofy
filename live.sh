#!/usr/bin/env bash
# Restart the server whenever changes to source files are detected
fd "\.go"|entr -n -s "echo 'Rebuilding...'; pkill lofy; go build && ./lofy&"
