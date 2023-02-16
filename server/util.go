package server

import (
    "fmt"
    "io/fs"
    "log"
    "os"
    "path/filepath"
    "runtime"
    "strings"
)

func TranslateTilde(path string) string {
    home, _ := os.UserHomeDir()
    return strings.ReplaceAll(path, "~", home)
}

func Die(strs ...interface{}) {
    strs = append(strs, "\n")
    logPrefix("31", "FATAL")
    log.Fatal(strs...)
}

func Info(strs ...interface{}) {
    logPrefix("32", "INFO")
    log.Println(strs...)
}

func Debug(strs ...interface{}) {
    if CONFIG.DEBUG {
        logPrefix("34", "DEBUG")
        log.Println(strs...)
    }
}

func Debugf(fmt string, strs ...interface{}) {
    if CONFIG.DEBUG {
        logPrefix("34", "DEBUG")
        log.Printf(fmt, strs...)
    }
}

func Warn(args ...interface{}) {
    logPrefix("33", "WARN")
    log.Println(args...)
}

func Err(args ...interface{}) {
    logPrefix("31", "ERROR")
    log.Println(args...)
}

func logPrefix(color string, label string) {
    _, file, line, ok := runtime.Caller(2)
    caller := ""
    if ok {
        caller = filepath.Base(file) + ":" + fmt.Sprint(line)
    }
    if CONFIG.LOG_COLOR {
        log.SetPrefix("\033[" + color + "m" + label + "\033[0m [" + caller + "] ")
    } else {
        log.SetPrefix(label + "[" + caller + "] ")
    }
}

// Returns all non-hidden files or directories in the provided array
func FsFilter(entries []fs.DirEntry, isDir bool) []fs.DirEntry {
    filtered := make([]fs.DirEntry, 0, len(entries))
    for _, entry := range entries {
        if entry.IsDir() == isDir && entry.Name()[0] != '.' {
            filtered = append(filtered, entry)
        }
    }
    return filtered
}

func Contains(arr []string, target string) int {
    for i, a := range arr {
        if a == target {
            return i
        }
    }
    return -1
}
