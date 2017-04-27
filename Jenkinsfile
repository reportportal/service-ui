#!groovy

node {

       dir('src/github.com/reportportal') {
           checkout scm

           stage('Checkout'){
                checkout scm
                sh 'git checkout golang'
                sh 'git pull'
            }



            stage('Build Server') {
                // Install the desired Go version
                def root = tool name: 'go-1.8.1', type: 'go'

                // Export environment variables pointing to the directory where Go was installed
                withEnv(["GOROOT=${root}","PATH+GO=${root}/bin","GOPATH=${env.WORKSPACE}","PATH+GOPATH=${env.WORKSPACE}/bin"]) {
                     sh 'echo $GOROOT'
                     sh 'make build-server'
                }
            }
       }

}

