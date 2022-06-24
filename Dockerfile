FROM nginx:alpine

LABEL maintainer="Andrei Varabyeu <andrei_varabyeu@epam.com>"
LABEL version=5.7.2

ENV APP_DOWNLOAD_URL https://github.com/reportportal/service-ui/releases/download/v5.7.2

ADD ${APP_DOWNLOAD_URL}/ui.tar.gz /

RUN tar -zxvf ui.tar.gz -C /usr/share/nginx/html && rm -f ui.tar.gz
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 8080
