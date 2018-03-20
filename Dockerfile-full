FROM golang:1.10 as build-backend
WORKDIR /go/src/github.com/reportportal/service-ui/
ARG service
ARG version
COPY ./Makefile ./glide.yaml ./glide.lock ./main.go ./
RUN make get-build-deps
RUN make build-server

FROM node:argon as build-frontend
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
COPY ./src/main/resources/public/package.json /usr/src/app/
RUN npm install
COPY ./src/main/resources/public/ /usr/src/app/
RUN npm run build && npm run test

FROM alpine:latest
RUN apk --no-cache add ca-certificates
WORKDIR /root/
COPY --from=build-backend /go/src/github.com/reportportal/service-ui/bin/service-ui /
COPY --from=build-frontend /usr/src/app/ /public

ENV RP_STATICS_PATH=/public

EXPOSE 8080
ENTRYPOINT ["/service-ui"]