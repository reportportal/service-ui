#!/bin/sh -e

export API_URL=${API_URL:-../api}
export AUTH_URL=${AUTH_URL:-../uat}

echo "Generating config.json from template..."

if ! envsubst < /usr/share/nginx/html/config.template.json > /usr/share/nginx/html/config.json; then
    echo "Error: Failed to generate config.json from template"
    exit 1
fi

echo "Starting nginx..."

exec nginx -g 'daemon off;'
