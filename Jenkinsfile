#!groovy

node {

    load "$JENKINS_HOME/jobvars.env"

    dir('src/github.com/reportportal/service-ui') {

        stage('Checkout') {
            checkout scm
            sh 'git checkout v5.1'
            sh 'git pull'
        }


            docker.withServer("$DOCKER_HOST") {
                stage('Build Docker Image') {
                    withEnv(["NODE_OPTIONS=--max_old_space_size=4096"]) {
                        sh """
                            MAJOR_VER=\$(cat VERSION)
                            BUILD_VER="\${MAJOR_VER}-${env.BUILD_NUMBER}"
                            make IMAGE_NAME=reportportal-dev-5-1/service-ui build-image-dev v=\$BUILD_VER
                        """
                    }
                }

                stage('Deploy container') {
                    sh "docker-compose -p reportportal5-1 -f $COMPOSE_FILE_RP_5_1 up -d --force-recreate ui"
                }
            }
    }
}

