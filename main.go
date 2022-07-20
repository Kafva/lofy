package main
import(
	"fmt"
	"os/exec"
	"os"
	"net/http"
	"path/filepath"
)

func get_cwd() string {
	ex, err := os.Executable()
	if err != nil {
		panic(err)
	}
	return filepath.Dir(ex)
}


func get_url(w http.ResponseWriter, r *http.Request) {
	cmd 	  := exec.Command("./dl.sh")
	out,_ 	:= cmd.Output()

	w.Header().Set("Access-Control-Allow-Origin", "*")
	fmt.Fprintf(w, string(out))
}

func main(){
  cwd := get_cwd()
	fs := http.FileServer(http.Dir(cwd + "/dist/"))
	http.Handle("/", fs)

	http.HandleFunc("/url", get_url)
	http.ListenAndServe("127.0.0.1:20111", nil)
}

