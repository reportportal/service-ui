package main

import (
	"github.com/go-chi/chi"
	"github.com/gorilla/handlers"
	"github.com/unrolled/secure"
	"gopkg.in/reportportal/commons-go.v1/commons"
	"gopkg.in/reportportal/commons-go.v1/conf"
	"gopkg.in/reportportal/commons-go.v1/server"
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

	rpConf := struct {
		Cfg         *conf.RpConfig
		StaticsPath string `env:"RP_STATICS_PATH"`
	}{
		Cfg:         conf.EmptyConfig(),
		StaticsPath: currDir,
	}

	err := conf.LoadConfig(&rpConf)
	if nil != err {
		log.Fatalf("Cannot log app config")
	}

	rpConf.Cfg.AppName = "ui"

	info := commons.GetBuildInfo()
	info.Name = "Service UI"

	srv := server.New(rpConf.Cfg, info)
	srv.WithRouter(func(router *chi.Mux) {

		//apply compression
		router.Use(func(next http.Handler) http.Handler {
			return handlers.CompressHandler(next)
		})

		//apply content security policies
		router.Use(func(next http.Handler) http.Handler {
			return secure.New(secure.Options{
				FrameDeny:             true,
				ContentTypeNosniff:    true,
				BrowserXssFilter:      true,
				ContentSecurityPolicy: "default-src 'self'",
			}).Handler(next)
		})

		err := os.Chdir(rpConf.StaticsPath)
		if nil != err {
			log.Fatalf("Dir %s not found", rpConf.StaticsPath)
		}

		router.Handle("/*", http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			//trim query params
			ext := filepath.Ext(trimQuery(r.URL.String(), "?"))

			// never cache html
			if "/" == r.URL.String() || ".html" == ext {
				w.Header().Add("Cache-Control", "no-cache")
			}

			http.FileServer(http.Dir(rpConf.StaticsPath)).ServeHTTP(&redirectingRW{ResponseWriter: w, Request: r}, r)
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

type redirectingRW struct {
	*http.Request
	http.ResponseWriter
	ignore bool
}

func (hrw *redirectingRW) Header() http.Header {
	return hrw.ResponseWriter.Header()
}

func (hrw *redirectingRW) WriteHeader(status int) {
	if status == 404 {
		hrw.ignore = true
		http.Redirect(hrw.ResponseWriter, hrw.Request, "/ui/404.html", http.StatusTemporaryRedirect)
	} else {
		hrw.ResponseWriter.WriteHeader(status)
	}

}

func (hrw *redirectingRW) Write(p []byte) (int, error) {
	if hrw.ignore {
		return len(p), nil
	}
	return hrw.ResponseWriter.Write(p)
}
