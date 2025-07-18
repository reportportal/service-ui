#!/bin/sh -e

export API_URL=${API_URL:-../api}
export AUTH_URL=${AUTH_URL:-../uat}

envsubst < /usr/share/nginx/html/config.template.json > /usr/share/nginx/html/config.json

exec nginx -g 'daemon off;'
