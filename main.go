package main

import (
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strings"

	"github.com/go-chi/chi"
	"github.com/go-chi/chi/middleware"
	"github.com/reportportal/commons-go/commons"
	"github.com/reportportal/commons-go/conf"
	"github.com/reportportal/commons-go/server"
	"github.com/unrolled/secure"
)

func main() {
	currDir, e := os.Getwd()
	if nil != e {
		log.Fatalf("Cannot get workdir: %s", e.Error())
	}
	cfg := conf.EmptyConfig()
	rpConf := struct {
		Cfg         *conf.ServerConfig
		StaticsPath string `env:"RP_STATICS_PATH"`
	}{
		Cfg:         cfg,
		StaticsPath: currDir,
	}
	err := conf.LoadConfig(&rpConf)
	if nil != err {
		log.Fatalf("Cannot log app config")
	}
	info := commons.GetBuildInfo()
	info.Name = "Service UI"
	srv := server.New(rpConf.Cfg, info)
	configureRouter(srv, rpConf)
	srv.StartServer()
}

func configureRouter(srv *server.RpServer, rpConf struct {
	Cfg         *conf.ServerConfig
	StaticsPath string `env:"RP_STATICS_PATH"`
}) {
	srv.WithRouter(func(router *chi.Mux) {
		// apply compression
		router.Use(middleware.DefaultCompress)
		router.Use(middleware.Logger)
		// content security policy
		csp := map[string][]string{
			"default-src": {"'self'", "data:", "'unsafe-inline'", "*.uservoice.com"},
			"script-src": {
				"'self'",
				"'unsafe-inline'",
				"'unsafe-eval'",
				"status.reportportal.io",
				"www.google-analytics.com",
				"stats.g.doubleclick.net",
				"*.saucelabs.com",
				"*.epam.com",
				"*.uservoice.com",
				"*.rawgit.com",
			},
			"worker-src":     {"'self'", "blob:"},
			"font-src":       {"'self'", "data:", "fonts.googleapis.com", "fonts.gstatic.com", "*.rawgit.com"},
			"style-src-elem": {"'self'", "data:", "'unsafe-inline'", "*.googleapis.com", "*.rawgit.com"},
			"media-src":      {"'self'", "*.saucelabs.com", "blob:"},
			"img-src":        {"*", "'self'", "data:", "blob:"},
			"object-src":     {"'self'"},
		}
		// apply content security policies
		var STSSeconds int64 = 315360000
		router.Use(func(next http.Handler) http.Handler {
			return secure.New(secure.Options{
				ContentTypeNosniff:    true,
				BrowserXssFilter:      true,
				ContentSecurityPolicy: buildCSP(csp),
				STSSeconds:            STSSeconds,
				STSIncludeSubdomains:  true,
				STSPreload:            true,
			}).Handler(next)
		})
		err := os.Chdir(rpConf.StaticsPath)
		if nil != err {
			log.Fatalf("Dir %s not found", rpConf.StaticsPath)
		}
		router.Handle("/*", http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			// trim query params
			ext := filepath.Ext(trimQuery(r.URL.String(), "?"))
			// never cache html
			if "/" == r.URL.String() || ".html" == ext {
				w.Header().Add("Cache-Control", "no-cache")
			}
			http.FileServer(http.Dir(rpConf.StaticsPath)).ServeHTTP(&redirectingRW{ResponseWriter: w, Request: r}, r)
		}))
	})
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
	notFoundStatusCode := 404
	if notFoundStatusCode == status {
		hrw.ignore = true
		http.Redirect(hrw.ResponseWriter, hrw.Request, "/ui/#notfound", http.StatusTemporaryRedirect)
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
