#!/usr/bin/env bash
retab(){
  : ''' Trim trailing whitespace and translate tabs to 2 spaces '''
  [ -z "" ] && { 
    echo "${funcstack[1]}${FUNCNAME[0]} <files ...>" >&2
    return 1
  }
  for f in $@; do
    [ -f "$f" ] || continue
    sed -i'.rm' -E 's/\t/  /g' "$f"; rm -f "$f.rm"
    sed -i'.rm' -E 's/ +$//g'  "$f"; rm -f "$f.rm"
  done
}

retab client/{components/*.tsx,ts/*.ts,index.tsx,scss/*.scss} server/*.go \
  package.json go.mod index.html main.go tsconfig.json vite.config.ts \
  scripts/*.sh README.md misc/lofy.example.json

eslint client/{components/*.tsx,ts/*.ts,index.tsx}
