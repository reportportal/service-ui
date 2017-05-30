#!groovy

node {

       load "$JENKINS_HOME/jobvars.env"

    dir('src/github.com/reportportal/service-ui') {

        stage('Checkout'){
                checkout scm
                sh 'git checkout develop'
                sh 'git pull'
            }

            stage('Build') {

            parallel 'Build UI': {
             docker.image('node:onbuild').inside('-u root') {
                                            sh 'make build-statics'
             }

            }, 'Build Server': {
                    // Export environment variables pointing to the directory where Go was installed
                    docker.image('golang:1.8.3').inside("-u root -e GOPATH=${env.WORKSPACE}")  {
                        sh 'PATH=$PATH:$GOPATH/bin && make build-server v=`cat VERSION`-$BUILD_NUMBER'
                    }
                    archiveArtifacts artifacts: 'bin/*'
                }
            }

           withEnv(["IMAGE_POSTFIX=dev-golang"]) {
                 docker.withServer("$DOCKER_HOST") {
                                  stage('Build Docker Image') {
                                          sh 'make build-image'
                                  }

                                  stage('Deploy container') {
                                          sh "docker-compose -p reportportal -f $COMPOSE_FILE up -d --force-recreate ui"
                                  }
                 }
           }



        }
}

