package main

import (
  "strconv"
  "net/http"
  "os/exec"
)

const PORT = 20111

func get_url(w http.ResponseWriter, r *http.Request) {
  cmd     := exec.Command("./scripts/dl.sh")
  out,_   := cmd.Output()

  w.Header().Set("Access-Control-Allow-Origin", "*")
  w.Write(out);
}

func main(){
  fs := http.FileServer(http.Dir("./pkg/"))
  http.Handle("/", fs)

  http.HandleFunc("/url", get_url)
  http.ListenAndServe("127.0.0.1:"+strconv.Itoa(PORT), nil)
}

