package main

import (
	"github.com/gorilla/handlers"
	"github.com/reportportal/commons-go/conf"
	"github.com/reportportal/commons-go/server"
	"goji.io"
	"goji.io/pat"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strings"
)

func main() {

	currDir, e := os.Getwd()
	if nil != e {
		log.Fatalf("Cannot get workdir: %s", e.Error())
	}

	rpConf := conf.LoadConfig("", map[string]interface{}{"staticsPath": currDir})

	rpConf.AppName = "service-ui"

	srv := server.New(rpConf)
	srv.AddRoute(func(router *goji.Mux) {
		router.Use(func(next http.Handler) http.Handler {
			return handlers.LoggingHandler(os.Stdout, next)
		})
		router.Use(func(next http.Handler) http.Handler {
			return handlers.CompressHandler(next)
		})

		dir := rpConf.Get("staticsPath").(string)
		err := os.Chdir(dir)
		if nil != err {
			log.Fatalf("Dir %s not found", dir)
		}

		router.Use(func(next http.Handler) http.Handler {
			return handlers.LoggingHandler(os.Stdout, next)
		})

		router.Handle(pat.Get("/*"), http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			//trim query params
			ext := filepath.Ext(trimQuery(r.URL.String(), "?"))

			// never cache html
			if "/" == r.URL.String() || ".html" == ext {
				w.Header().Add("Cache-Control", "no-cache")
			}

			http.FileServer(http.Dir(dir)).ServeHTTP(w, r)
		}))

	})

	srv.StartServer()

}

func trimQuery(s string, sep string) string {
	sepIndex := strings.Index(s, sep)
	if -1 != sepIndex {
		return s[:sepIndex]
	}
	return s
}
