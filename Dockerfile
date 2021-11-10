FROM alpine:3.10

LABEL maintainer="Andrei Varabyeu <andrei_varabyeu@epam.com>"
LABEL version=5.5.1

ENV APP_DOWNLOAD_URL https://github.com/reportportal/service-ui/releases/download/v5.5.1

ADD ${APP_DOWNLOAD_URL}/service-ui_linux_amd64 /service-ui
ADD ${APP_DOWNLOAD_URL}/ui.tar.gz /

RUN mkdir /public
RUN chmod +x /service-ui
RUN tar -zxvf ui.tar.gz -C /public && rm -f ui.tar.gz

ENV RP_STATICS_PATH=/public


EXPOSE 8080
ENTRYPOINT ["/service-ui"]