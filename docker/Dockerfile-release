FROM openjdk:8-jre-alpine

LABEL maintainer "Andrei Varabyeu <andrei_varabyeu@epam.com>"
LABEL version="@version@"
LABEL description="@description@"

ENV APP_FILE @name@-@version@
ENV APP_DOWNLOAD_URL https://dl.bintray.com/epam/reportportal/com/epam/reportportal/@name@/@version@/$APP_FILE.jar
ENV JAVA_OPTS="-Xmx192m"

VOLUME /tmp
RUN apk add --update openssl
RUN wget -O /app.jar $APP_DOWNLOAD_URL

EXPOSE 8080
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -Djava.security.egd=file:/dev/./urandom -jar /app.jar"]
