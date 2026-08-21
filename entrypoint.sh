#!/bin/sh -e

export API_URL=${API_URL:-../api}
export AUTH_URL=${AUTH_URL:-../uat}
export EXTRA_NGINX_CONFIG=${EXTRA_NGINX_CONFIG:-/etc/nginx/extra-conf.d/*.conf}

if [ "$APP_ENV" = "prod" ]; then
    export STATIC_CACHE_CONTROL="public, max-age=2592000, s-maxage=31536000"
else
    export STATIC_CACHE_CONTROL="public, must-revalidate"
fi

echo "Generating config.json from template..."

if ! envsubst < /usr/share/nginx/html/config.template.json > /usr/share/nginx/html/config.json; then
    echo "Error: Failed to generate config.json from template" >&2
    exit 1
fi

echo "Generating nginx.conf from template..."

if ! envsubst '${STATIC_CACHE_CONTROL} ${EXTRA_NGINX_CONFIG}' < /etc/nginx/nginx.conf.template > /tmp/nginx.conf; then
    echo "Error: Failed to generate nginx.conf from template" >&2
    exit 1
fi

echo "Validating nginx configuration..."

if ! nginx -t -c /tmp/nginx.conf; then
    echo "Error: Invalid nginx configuration" >&2
    exit 1
fi

echo "Starting nginx..."

exec nginx -c /tmp/nginx.conf -g 'daemon off;'
