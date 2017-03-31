FROM frolvlad/alpine-oraclejdk8:slim

MAINTAINER Andrei Varabyeu <andrei_varabyeu@epam.com>
LABEL version="@version@"
LABEL description="@description@"

ENV JAVA_OPTS="-Xmx192m"

VOLUME /tmp
ADD @name@-@version@.jar app.jar

RUN sh -c 'touch /app.jar'

EXPOSE 8080

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -Djava.security.egd=file:/dev/./urandom -jar /app.jar"]

