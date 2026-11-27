# Only for technical/build aims, built image will be with nginx/nginx-unprivileged:alpine according to the last step

# The build stages produce only static files (JSON, JS, CSS, HTML), which are the same for every architecture, so they
# run on the builder's native platform ($BUILDPLATFORM). For multi-arch builds this avoids running npm ci and webpack
# under QEMU emulation; only the final nginx stage is built per target platform.
FROM --platform=$BUILDPLATFORM alpine:3.23.3 AS generate-build-info
RUN mkdir -p /usr/src/app/build
WORKDIR /usr/src
ARG APP_VERSION=develop
ARG BUILD_BRANCH
ARG BUILD_DATE
RUN echo {\"build\": { \"version\": \"${APP_VERSION}\", \"branch\": \"${BUILD_BRANCH}\", \"build_date\": \"${BUILD_DATE}\", \"name\": \"Service UI\", \"repo\": \"reportportal/service-ui\"}} > ./app/build/buildInfo.json

FROM --platform=$BUILDPLATFORM node:20-alpine AS build-frontend
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
COPY ./app/ /usr/src/app/
# ENV, not `RUN export`: each RUN is its own shell, so the exported value was gone before the
# build below ever started and webpack ran on the default heap.
ENV NODE_OPTIONS="--max-old-space-size=4096"
RUN npm ci --legacy-peer-deps && npm run build

FROM nginx/nginx-unprivileged:1.30.7-alpine3.24

USER root

# Refresh OS packages in the runtime image to pick up Alpine security fixes.
RUN apk update && apk upgrade --no-cache

COPY --from=build-frontend /usr/src/app/build /usr/share/nginx/html
COPY --from=generate-build-info /usr/src/app/build /usr/share/nginx/html
COPY config.template.json /usr/share/nginx/html/config.template.json

RUN rm /etc/nginx/conf.d/default.conf \
    && mkdir -p /etc/nginx/extra-conf.d
COPY nginx.conf /etc/nginx/nginx.conf.template

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

USER $UID

EXPOSE 8080

ENTRYPOINT ["/entrypoint.sh"]