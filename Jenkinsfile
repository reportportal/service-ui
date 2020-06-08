#!groovy

node {

    load "$JENKINS_HOME/jobvars.env"

    dir('src/github.com/reportportal/service-ui') {

        stage('Checkout') {
            checkout scm
        }


            docker.withServer("$DOCKER_HOST") {
                stage('Build Docker Image') {
                    withEnv(["NODE_OPTIONS=--max_old_space_size=4096"]) {
                        sh """
                            MAJOR_VER=\$(cat VERSION)
                            BUILD_VER="\${MAJOR_VER}-${env.BUILD_NUMBER}"
                            make IMAGE_NAME=reportportal-dev/service-ui build-image-dev v=\$BUILD_VER
                        """
                    }
                }

                stage('Deploy container') {
                    sh "docker-compose -p reportportal -f $COMPOSE_FILE_RP up -d --force-recreate ui"
                    
                    stage('Push to ECR') {
                       withEnv(["AWS_URI=${AWS_URI}", "AWS_REGION=${AWS_REGION}"]) {
                           sh 'docker tag reportportal-dev/service-ui ${AWS_URI}/service-ui'
                           sh 'docker tag reportportal-dev/service-ui ${LOCAL_REGISTRY}/service-ui'
                           sh 'docker push ${LOCAL_REGISTRY}/service-ui'
                           def image = env.AWS_URI + '/service-ui'
                           def url = 'https://' + env.AWS_URI
                           def credentials = 'ecr:' + env.AWS_REGION + ':aws_credentials'
                           docker.withRegistry(url, credentials) {
                               docker.image(image).push('SNAPSHOT-${BUILD_NUMBER}')
                           }
                       }
                    }
                }
                
                stage('Cleanup') {
                    docker.withServer("$DOCKER_HOST") {
                       withEnv(["AWS_URI=${AWS_URI}", "LOCAL_REGISTRY=${LOCAL_REGISTRY}"]) {
                            sh 'docker rmi ${AWS_URI}/service-ui:SNAPSHOT-${BUILD_NUMBER}'
                            sh 'docker rmi ${AWS_URI}/service-ui:latest'
                            sh 'docker rmi ${LOCAL_REGISTRY}/service-ui:latest'
                        }
                    }
                }
            }
    }
}

