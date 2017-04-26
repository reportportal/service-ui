pipeline {
    agent any

    stages {
        stage('Build UI') {
            steps {
                echo 'Building UI..'
                sh 'make build-statics'
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
