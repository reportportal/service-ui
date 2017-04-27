#!groovy

node {

       stage('Checkout'){
          checkout scm
          sh 'git checkout golang'
          sh 'git pull'
       }

       stage('Build UI') {
            docker.image('node').inside {
                        stage "Checkout and build deps"
                            sh "npm install"

                        stage "Test and validate"
                            sh "npm install gulp-cli && ./node_modules/.bin/gulp"
            }

       }

       stage('Build Server') {
             // Install the desired Go version
             def root = tool name: 'go-1.8.1', type: 'go'

             // Export environment variables pointing to the directory where Go was installed
             withEnv(["GOROOT=${root}", "PATH+GO=${root}/bin"]) {
                 sh 'make build-statics'
             }
       }

}

