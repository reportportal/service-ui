FROM alpine:latest

MAINTAINER Andrei Varabyeu <andrei_varabyeu@epam.com>

ADD ./bin/service-ui /
ADD ./build/resources/main/public /public

ENV RP_STATICSPATH=/public

EXPOSE 8080
ENTRYPOINT ["/service-ui"]
