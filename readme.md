# UI service for Report Portal

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![stackoverflow](https://img.shields.io/badge/reportportal-stackoverflow-orange.svg?style=flat)](http://stackoverflow.com/questions/tagged/reportportal)

[![Build](https://github.com/reportportal/service-ui/actions/workflows/build.yml/badge.svg)](https://github.com/reportportal/service-ui/actions/workflows/build.yml)
[![Code Coverage](https://codecov.io/gh/reportportal/service-ui/branch/master/graph/badge.svg)](https://codecov.io/gh/reportportal/service-ui)
[![GitHub release (latest SemVer)](https://img.shields.io/github/v/release/reportportal/service-ui?sort=semver)](https://github.com/reportportal/service-ui/releases/latest)
[![Docker Pulls](https://img.shields.io/docker/pulls/reportportal/service-ui.svg?maxAge=159200)](https://hub.docker.com/r/reportportal/service-ui/)

1. Install nodejs (version 20 is recommended)

2. Open console from the project root

3. Run the command `cd app`

4. Run the command `npm install --legacy-peer-deps` or `npm ci --legacy-peer-deps`

5. Create file `.env` in `app` folder

```
PROXY_PATH='' // http://you_server:port/
```

6. Run command `npm run dev`

7. Open `http://localhost:3000/` in browser

## Additional Nginx server configuration

The image can load optional server-level Nginx snippets from
`/etc/nginx/extra-conf.d/*.conf`. If the directory is empty, the image uses only
its built-in configuration.

The snippets are included inside the existing `server` block. They may contain
directives such as `location`, `set`, and `proxy_set_header`, but must not
contain an `http` or `server` block.

For example, a Kubernetes ConfigMap can add a location:

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: service-ui-nginx-extra
data:
  deployment-info.conf: |
    location = /deployment-info {
        default_type text/plain;
        return 200 "service-ui";
    }
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: service-ui
spec:
  template:
    spec:
      containers:
        - name: service-ui
          image: reportportal/service-ui:latest
          env:
            - name: EXTRA_NGINX_CONFIG
              value: /etc/nginx/extra-conf.d/*.conf
          volumeMounts:
            - name: nginx-extra
              mountPath: /etc/nginx/extra-conf.d
              readOnly: true
      volumes:
        - name: nginx-extra
          configMap:
            name: service-ui-nginx-extra
```

`EXTRA_NGINX_CONFIG` is optional and defaults to the value shown above. Mounting
the ConfigMap at this dedicated path does not replace the image's built-in
Nginx configuration.

Treat proxy authentication headers as a security boundary. Only set a trusted
`X-WEBAUTH-USER` after validating the application session, for example with
Nginx `auth_request`. Clear an incoming browser `Authorization` header unless
the upstream is explicitly intended to receive it. Bearer tokens are secrets:
store them in a Kubernetes Secret, not a ConfigMap. Mounted snippets are loaded
directly and are not processed by `envsubst`, so secret-to-header rendering
requires a separate controlled mechanism or authentication proxy.

   
