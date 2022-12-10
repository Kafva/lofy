#!/usr/bin/env bash
retab(){
  for f in $@; do
    [ -f "$f" ] || continue
    sed -i'.rm' -E 's/\t/  /g' "$f"; rm -f "$f.rm"
    sed -i'.rm' -E 's/ +$//g'  "$f"; rm -f "$f.rm"
  done
}

# Trim trailing whitespace and translate tabs to 2 spaces
retab client/{components/*.tsx,ts/*.ts,index.tsx,scss/*.scss} server/*.go \
  package.json go.mod index.html main.go tsconfig.json vite.config.ts \
  scripts/*.sh README.md misc/lofy.example.json

eslint client/{components/*.tsx,ts/*.ts,index.tsx}
