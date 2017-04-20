FROM alpine:latest

MAINTAINER Andrei Varabyeu <andrei_varabyeu@epam.com>

ADD ./bin/service-ui /

ENV RP_STATICSPATH=/public

EXPOSE 8080
ENTRYPOINT ["/service-ui"]
