#!groovy

node {

    load "$JENKINS_HOME/jobvars.env"

    dir('src/github.com/reportportal/service-ui') {

        stage('Checkout') {
            checkout scm
            sh 'git checkout v5-kronos'
            sh 'git pull'
        }


            docker.withServer("$DOCKER_HOST") {
                stage('Build Docker Image') {
                    sh 'make build-image-dev'
                }

                stage('Deploy container') {
                    sh "docker-compose -p reportportal5 -f $COMPOSE_FILE_RP_5 up -d --force-recreate ui"
                }
            }


    }
}

