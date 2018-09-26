#!groovy

node {

    load "$JENKINS_HOME/jobvars.env"

    dir('src/github.com/reportportal/service-ui') {

        stage('Checkout') {
            checkout scm
            sh 'git checkout develop'
            sh 'git pull'
        }

        withEnv(["IMAGE_POSTFIX=-dev"]) {
            docker.withServer("$DOCKER_HOST") {
                stage('Build Docker Image') {
                    sh 'make build-image-dev'
                }

                stage('Deploy container') {
                    sh "docker-compose -p reportportal -f $COMPOSE_FILE up -d --force-recreate ui"
                }
            }
        }


    }
}

