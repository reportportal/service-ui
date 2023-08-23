# Only for technical/build aims, built image will be with nginxinc/nginx-unprivileged:alpine according to the last step

FROM alpine:latest AS generate-build-info
RUN mkdir -p /usr/src/app/build
WORKDIR /usr/src
ARG APP_VERSION=develop
ARG BUILD_BRANCH
ARG BUILD_DATE
RUN echo {\"build\": { \"version\": \"${APP_VERSION}\", \"branch\": \"${BUILD_BRANCH}\", \"build_date\": \"${BUILD_DATE}\", \"name\": \"Service UI\", \"repo\": \"reportportal/service-ui\"}} > ./app/build/buildInfo.json

FROM node:14-alpine AS build-frontend
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
COPY ./app/ /usr/src/app/
RUN export NODE_OPTIONS="--max-old-space-size=4096"
RUN npm ci && npm run build

FROM nginxinc/nginx-unprivileged:alpine

USER root

COPY --from=build-frontend /usr/src/app/build /usr/share/nginx/html
COPY --from=generate-build-info /usr/src/app/build /usr/share/nginx/html

RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/nginx.conf

USER $UID

EXPOSE 8080
