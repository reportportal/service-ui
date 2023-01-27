FROM nginxinc/nginx-unprivileged:alpine

LABEL maintainer="Andrei Varabyeu <andrei_varabyeu@epam.com>"
LABEL version=5.7.3

ENV APP_DOWNLOAD_URL https://github.com/reportportal/service-ui/releases/download/v5.7.3

USER root
ADD ${APP_DOWNLOAD_URL}/ui.tar.gz /

RUN tar -zxvf ui.tar.gz -C /usr/share/nginx/html && rm -f ui.tar.gz
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/nginx.conf

USER $UID

EXPOSE 8080
