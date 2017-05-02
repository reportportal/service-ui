#!groovy

node {

       load "$JENKINS_HOME/jobvars.env"

       dir('src/github.com/reportportal') {

           stage('Checkout'){
                checkout scm
                sh 'git checkout golang'
                sh 'git pull'
            }

            parallel 'Build UI': {
             docker.image('node:onbuild').inside('-u root') {
                               sh 'make build-statics'
             }

            }, 'Build Server': {
                 // Export environment variables pointing to the directory where Go was installed
                 docker.image('golang:1.8.1').inside("-u root -e GOPATH=${env.WORKSPACE}")  {
                        sh 'PATH=$PATH:$GOPATH/bin && make build-server'
                 }
                 archiveArtifacts artifacts: 'bin/*'

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

