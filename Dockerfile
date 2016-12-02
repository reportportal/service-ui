FROM frolvlad/alpine-oraclejdk8:slim

MAINTAINER Andrei Varabyeu <andrei_varabyeu@epam.com>

VOLUME /tmp
ADD https://dl.bintray.com/epam/reportportal/com/epam/reportportal/service-ui/2.7.0/service-ui-2.7.0.jar /app.jar
RUN sh -c 'touch /app.jar'
EXPOSE 8080
ENTRYPOINT ["java","-Xmx256m","-Djava.security.egd=file:/dev/./urandom","-jar","/app.jar"]
