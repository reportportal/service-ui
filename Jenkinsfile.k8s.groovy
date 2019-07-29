#!groovy

//String podTemplateConcat = "${serviceName}-${buildNumber}-${uuid}"
def label = "worker-${UUID.randomUUID().toString()}"
println("label")
println("${label}")

podTemplate(
        label: "${label}",
        containers: [
                containerTemplate(name: 'jnlp', image: 'jenkins/jnlp-slave:alpine'),
                containerTemplate(name: 'docker', image: 'docker:dind', ttyEnabled: true, alwaysPullImage: true, privileged: true,
                        command: 'dockerd --host=unix:///var/run/docker.sock --host=tcp://0.0.0.0:2375 --storage-driver=overlay'),
                containerTemplate(name: 'nodejs', image: 'node:11-alpine', ttyEnabled: true, command: 'cat'),
                containerTemplate(name: 'golang', image: 'golang:1.12.7', ttyEnabled: true, command: 'cat'),

//              containerTemplate(name: 'kubectl', image: 'lachlanevenson/k8s-kubectl:v1.8.8', command: 'cat', ttyEnabled: true),
//              containerTemplate(name: 'helm', image: 'lachlanevenson/k8s-helm:latest', command: 'cat', ttyEnabled: true)
        ],
        imagePullSecrets: ["regcred"],
        volumes: [
                emptyDirVolume(memory: false, mountPath: '/var/lib/docker'),
                secretVolume(mountPath: '/etc/.dockercreds', secretName: 'docker-creds'),
                hostPathVolume(mountPath: '/usr/local/go/pkg/mod', hostPath: '/tmp/jenkins/go')
        ]
) {

    node("${label}") {

        properties([
                pipelineTriggers([
                        pollSCM('H/10 * * * *')
                ])
        ])

        stage('Configure') {
            container('docker') {
                sh 'echo "Initialize environment"'
                sh """
                QUAY_USER=\$(cat "/etc/.dockercreds/username")
                cat "/etc/.dockercreds/password" | docker login -u \$QUAY_USER --password-stdin quay.io
                """
            }
        }
        parallel 'Checkout Infra': {
            stage('Checkout Infra') {
                sh 'mkdir -p ~/.ssh'
                sh 'ssh-keyscan -t rsa github.com >> ~/.ssh/known_hosts'
                dir('kubernetes') {
                    git branch: "v5", url: 'https://github.com/reportportal/kubernetes.git'

                }
            }
        }, 'Checkout Service': {
            stage('Checkout Service') {
                dir('app') {
                    checkout scm
                }
            }
        }


        parallel 'Build UI': {
            dir('app') {
                dir('app') {
                    container('nodejs') {
                        sh "npm run build && npm run test"
                    }
                }
            }
        }, 'Build Webserver': {
            container('golang') {
                sh "make get-build-deps"
                sh "make build-server"
            }
        }


//        stage('Build Docker Image') {
//            dir('app') {
//                container('docker') {
//                    sh "docker build -f docker/Dockerfile-develop -t quay.io/reportportal/service-api:BUILD-${env.BUILD_NUMBER} ."
//                    sh "docker push quay.io/reportportal/service-api:BUILD-${env.BUILD_NUMBER}"
//                }
//
//            }
//        }


    }

}
