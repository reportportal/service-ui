FROM node:10.15.0-jessie as node
#Install git
RUN apt-get update && apt-get install -y git

RUN mkdir -p /app
WORKDIR /app

COPY ./src/main/resources/public/package.json /app/
RUN npm install
COPY ./src/main/resources/public/ /app/
RUN npm run compile
#&& npm run test

FROM alpine:3.6

LABEL maintainer="Maarten-Jan van Gool <maarten-jan.van.gool@praegus.nl>"
LABEL version=4.3.7

ENV APP_DOWNLOAD_URL https://dl.bintray.com/epam/reportportal/4.3.7

ADD ${APP_DOWNLOAD_URL}/service-ui_linux_amd64 /service-ui
COPY --from=node /app/ /public

RUN chmod +x /service-ui

ENV RP_STATICS_PATH=/public


EXPOSE 8080
ENTRYPOINT ["/service-ui"]
