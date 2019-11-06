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
                        sh """          
                            MAJOR_VER=\$(cat VERSION)
                            BUILD_VER="\${MAJOR_VER}-${env.BUILD_NUMBER}"
                            make build-image-dev v=\$BUILD_VER
                        """
                    }
                }

                stage('Deploy container') {
                    sh "docker-compose -p reportportal5 -f $COMPOSE_FILE_RP_5 up -d --force-recreate ui"
                }
            }
    }
}

