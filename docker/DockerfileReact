FROM alpine:latest

MAINTAINER Andrei Varabyeu <andrei_varabyeu@epam.com>

ADD ./bin/service-ui /
ADD ./app/build/ /public

ENV RP_STATICS_PATH=/public

EXPOSE 8080
ENTRYPOINT ["/service-ui"]
