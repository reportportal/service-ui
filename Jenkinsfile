pipeline {
    agent any

    stages {
        stage('Build UI') {
            steps {
                node {
                  withEnv(["PATH+NODE=${tool name: 'node-5.10.1', type: 'jenkins.plugins.nodejs.tools.NodeJSInstallation'}/bin"]) {
                    sh 'node -v'
                  }
                }
            }
        }
        stage('Build Server') {
            steps {
                echo 'Building Server..'
                sh 'make build-server'
            }
        }
    }
}
