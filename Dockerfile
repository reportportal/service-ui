# Only for technical/build aims, built image will be with nginxinc/nginx-unprivileged:alpine according to the last step

FROM alpine:3.20.3 AS generate-build-info
RUN mkdir -p /usr/src/app/build
WORKDIR /usr/src
ARG APP_VERSION=develop
ARG BUILD_BRANCH
ARG BUILD_DATE
RUN echo {\"build\": { \"version\": \"${APP_VERSION}\", \"branch\": \"${BUILD_BRANCH}\", \"build_date\": \"${BUILD_DATE}\", \"name\": \"Service UI\", \"repo\": \"reportportal/service-ui\"}} > ./app/build/buildInfo.json

FROM node:20-alpine AS build-frontend
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
COPY ./app/ /usr/src/app/
RUN export NODE_OPTIONS="--max-old-space-size=4096"
RUN npm ci --legacy-peer-deps && npm run build

FROM nginxinc/nginx-unprivileged:alpine

USER root

COPY --from=build-frontend /usr/src/app/build /usr/share/nginx/html
COPY --from=generate-build-info /usr/src/app/build /usr/share/nginx/html
COPY config.template.json /usr/share/nginx/html/config.template.json

RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/nginx.conf

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

USER $UID

EXPOSE 8080

ENTRYPOINT ["/entrypoint.sh"]