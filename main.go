package main

import (
	"net/http"
	"strconv"
	. "github.com/Kafva/lofy/server"
)

func main(){
  fs := http.FileServer(http.Dir("./dist/"))
  http.Handle("/", fs)

  http.HandleFunc("/url", GetUrl)
  http.HandleFunc("/playlists", GetPlaylists)
  http.HandleFunc("/albums", GetAlbums)
  http.HandleFunc("/err", GetErr)
  http.ListenAndServe(ADDR+":"+strconv.Itoa(PORT), nil)
}

