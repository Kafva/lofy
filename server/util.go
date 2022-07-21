package server

import (
	"log"
	"os"
	"strings"
)

func TranslateTilde(path string) string {
	home,_ := os.UserHomeDir()
	return strings.ReplaceAll(path, "~", home)
}

func Die(strs ... interface{}) {
	strs = append(strs, "\n")
	logPrefix("31", "FATAL")
	log.Fatal(strs ...)
}

func Debug(strs ... interface{}) {
	if DEBUG {
		logPrefix("34", "DEBUG")
		log.Println(strs ...)
	}
}

func Warn(args ... interface{}) {
	logPrefix("33", "WARN")
	log.Println(args ...)
}

func Err(args ... interface{}) {
	logPrefix("31", "ERROR")
	log.Println(args ...)
}


func logPrefix(color string, label string) {
	if LOG_COLOR {
		log.SetPrefix("\033["+color+"m"+label+"\033[0m ")
	} else {
		log.SetPrefix(label+" ")
	}
}

