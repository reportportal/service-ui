#!groovy

node {

    load "$JENKINS_HOME/jobvars.env"

    dir('src/github.com/reportportal/service-ui') {

        stage('Checkout') {
            checkout scm
            sh 'git checkout develop'
            sh 'git pull'
        }

        stage('Build') {

            parallel 'Build UI': {
                docker.image('node:6-onbuild').inside('-u root') {
                    sh 'make build-statics'
                }

            }, 'Build Server': {
                // Export environment variables pointing to the directory where Go was installed
                docker.image('golang:1.9.2').inside("-u root -e GOPATH=${env.WORKSPACE}") {
                    sh 'PATH=$PATH:$GOPATH/bin && mkdir $GOPATH/bin && make build-server v=`cat VERSION`-$BUILD_NUMBER'
                }
                archiveArtifacts artifacts: 'bin/*'
            }
        }

        withEnv(["IMAGE_POSTFIX=-dev"]) {
            docker.withServer("$DOCKER_HOST") {
                stage('Build Docker Image') {
                    sh 'make build-image'
                }

                stage('Build React Docker Image') {
                    sh 'make build-image-react'
                }

                stage('Deploy container') {
                    sh "docker-compose -p reportportal -f $COMPOSE_FILE up -d --force-recreate ui ui-react"
                }
            }
        }


    }
}

