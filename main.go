package main

import (
	"github.com/go-chi/chi"
	"github.com/unrolled/secure"
	"gopkg.in/reportportal/commons-go.v1/commons"
	"gopkg.in/reportportal/commons-go.v1/conf"
	"gopkg.in/reportportal/commons-go.v1/server"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"github.com/go-chi/chi/middleware"
)

func main() {

	currDir, e := os.Getwd()
	if nil != e {
		log.Fatalf("Cannot get workdir: %s", e.Error())
	}

	cfg := conf.EmptyConfig()
	cfg.Consul.Tags = []string{
		"urlprefix-/ui/ opts strip=/ui",
		"traefik.frontend.rule=PathPrefixStrip:/ui/",
	}
	rpConf := struct {
		Cfg         *conf.RpConfig
		StaticsPath string `env:"RP_STATICS_PATH"`
	}{
		Cfg:         cfg,
		StaticsPath: currDir,
	}

	err := conf.LoadConfig(&rpConf)
	if nil != err {
		log.Fatalf("Cannot log app config")
	}

	if "goRP" == rpConf.Cfg.AppName {
		rpConf.Cfg.AppName = "ui"
	}

	info := commons.GetBuildInfo()
	info.Name = "Service UI"

	srv := server.New(rpConf.Cfg, info)
	srv.WithRouter(func(router *chi.Mux) {

		//apply compression
		router.Use(middleware.DefaultCompress)
		router.Use(middleware.Logger)

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

func buildCSP(csp map[string][]string) string {
	var instr []string
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
