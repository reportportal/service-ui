#!groovy

node {

       stage('Checkout'){
          checkout scm
          sh 'git checkout golang'
          sh 'git pull'
       }

       withEnv(["PATH+NODE=${tool name: 'node-7.9.0', type: 'jenkins.plugins.nodejs.tools.NodeJSInstallation'}/bin"]) {
            stage('Build UI') {
                sh 'node -v'
                sh 'npm -version'
                sh 'node -version'
                sh 'ls -la'
                sh 'make build-statics'
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

