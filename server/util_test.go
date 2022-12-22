package server

import (
    "os"
    "testing"
)

func Test_FsFilter(t *testing.T) {
    if entries, err := os.ReadDir("../server/.tests/1"); err == nil {

        dirs_expected := []string{"d.m3u"}
        for i, d := range FsFilter(entries, true) {
            if d.Name() != dirs_expected[i] {
                t.Fatalf("FsFilter() failed (dir)")
            }
        }

        files_expected := []string{"a.m3u", "b.m3u", "c"}
        for i, f := range FsFilter(entries, false) {
            if f.Name() != files_expected[i] {
                t.Fatalf("FsFilter() failed (file)")
            }
        }

    }
}
