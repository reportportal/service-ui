#!groovy

node {

       stage('Checkout'){
          checkout scm
          sh 'git checkout golang'
          sh 'git pull'
       }



       stage('Build Server') {
             // Install the desired Go version
             def root = tool name: 'go-1.8.1', type: 'go'

             // Export environment variables pointing to the directory where Go was installed
             withEnv(["GOROOT=${root}","PATH+GO=${root}/bin","PATH+GOPATH=${env.JENKINS_HOME}/go/bin"]) {
                 sh 'echo $GOROOT'
                 sh 'make build-server'
             }
       }

}

