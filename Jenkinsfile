#!groovy

node {

    load "$JENKINS_HOME/jobvars.env"

    dir('src/github.com/reportportal/service-ui') {

        stage('Checkout') {
            checkout scm
            sh 'git checkout develop'
            sh 'git pull'
        }


            docker.withServer("$DOCKER_HOST") {
                stage('Build Docker Image') {
                    withEnv(["NODE_OPTIONS=--max_old_space_size=4096"]) {
                        sh 'make build-image-dev'
                    }
                }

                stage('Deploy container') {
                    sh "docker-compose -p reportportal5 -f $COMPOSE_FILE_RP_5 up -d --force-recreate ui"
                }
            }
    }
}

