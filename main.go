package main

import (
	"github.com/gorilla/handlers"
	"github.com/unrolled/secure"
	"github.com/reportportal/commons-go/commons"
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

	rpConf.AppName = "ui"

	info := commons.GetBuildInfo()
	info.Name = "Service UI"

	srv := server.New(rpConf, info)
	srv.AddRoute(func(router *goji.Mux) {
		router.Use(func(next http.Handler) http.Handler {
			return handlers.CompressHandler(next)
		})

		//content security policy
		csp := map[string][]string{
			"default-src": {"'self'", "'unsafe-inline'", "*.uservoice.com"},
			"script-src": {
				"'self'",
				"'unsafe-inline'",
				"'unsafe-eval'",
				"status.reportportal.io",
				"www.google-analytics.com",
				"stats.g.doubleclick.net",
				"*.epam.com",
				"*.uservoice.com",
			},
			"img-src":    {"'self'", "data:", "www.google-analytics.com", "stats.g.doubleclick.net", "*.epam.com", "*.uservoice.com"},
			"object-src": {"'self'"},
		}

		//apply content security policies
		router.Use(func(next http.Handler) http.Handler {
			return secure.New(secure.Options{
				ContentTypeNosniff:    true,
				BrowserXssFilter:      true,
				ContentSecurityPolicy: buildCSP(csp),
				STSSeconds:            315360000,
				STSIncludeSubdomains:  true,
				STSPreload:            true,
			}).Handler(next)
		})

		dir := rpConf.Get("staticsPath").(string)
		err := os.Chdir(dir)
		if nil != err {
			log.Fatalf("Dir %s not found", dir)
		}

		router.Use(func(next http.Handler) http.Handler {
			return handlers.LoggingHandler(os.Stdout, next)
		})

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

			http.FileServer(http.Dir(dir)).ServeHTTP(&redirectingRW{ResponseWriter: w, Request: r}, r)
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

func buildCSP(csp map[string][]string) string {
	instr := make([]string, len(csp))
	for k, v := range csp {
		instr = append(instr, k+" "+strings.Join(v, " "))
	}
	return strings.Join(instr, "; ")

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
