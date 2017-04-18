FROM alpine:latest

MAINTAINER Andrei Varabyeu <andrei_varabyeu@epam.com>

RUN apk --update --no-cache add unzip wget ca-certificates && \
    update-ca-certificates


## OK. We're all set. Let's grap RP's UI statics
ENV REPO_URL="https://dl.bintray.com/epam/reportportal/com/epam/reportportal"
ENV SERVICE_UI_VERSION="3.0.0-BETA-3"

RUN wget -O /tmp/service-ui.jar $REPO_URL/service-ui/$SERVICE_UI_VERSION/service-ui-$SERVICE_UI_VERSION.jar && \
    unzip /tmp/service-ui.jar -d /tmp/reportportal && \
    mv /tmp/reportportal/BOOT-INF/classes/public/ /public && \
    rm -f /tmp/service-ui.jar && \
    rm -rf /tmp/reportportal && \
    apk del unzip wget


ADD ./bin/gorpUI /

ENV RP_STATICSPATH=/public

EXPOSE 8080
ENTRYPOINT ["/gorpUI"]