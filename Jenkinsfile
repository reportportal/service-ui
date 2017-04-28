#!groovy

node {

       dir('src/github.com/reportportal') {

           stage('Checkout'){
                checkout scm
                sh 'git checkout golang-docker'
                sh 'git pull'
            }

            stage('Build UI') {
                docker.image('node:onbuild').inside('-u root') {
                   sh 'make build-statics'
                 }
            }

            stage('Build Server') {
                 // Export environment variables pointing to the directory where Go was installed
                 docker.image('golang:1.8.1').inside("-u root -e GOPATH=${env.WORKSPACE}")  {
                        sh 'PATH=$PATH:$GOPATH/bin && make build-server'
                 }
                 archiveArtifacts artifacts: 'bin/*'

            }

            stage('Build Docker Image') {
                withEnv(["IMAGE_POSTFIX=dev-golang"]) {
                    sh 'make build-image'
                }
            }

        }
}

