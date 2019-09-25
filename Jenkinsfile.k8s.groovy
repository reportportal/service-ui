#!groovy

//String podTemplateConcat = "${serviceName}-${buildNumber}-${uuid}"
def label = "worker-${UUID.randomUUID().toString()}"
println("label")
println("${label}")

podTemplate(
        label: "${label}",
        containers: [
                containerTemplate(name: 'jnlp', image: 'jenkins/jnlp-slave:alpine'),
                containerTemplate(name: 'docker', image: 'docker', command: 'cat', ttyEnabled: true),
                containerTemplate(
                        name: 'nodejs',
                        image: 'node:11-alpine',
                        ttyEnabled: true,
                        command: 'cat',
                        envVars: [
                                envVar(key: 'NODE_OPTIONS', value: '--max_old_space_size=4096')
                        ]),
                containerTemplate(name: 'golang', image: 'golang:1.12.7', ttyEnabled: true, command: 'cat'),
                containerTemplate(name: 'kubectl', image: 'lachlanevenson/k8s-kubectl:v1.8.8', command: 'cat', ttyEnabled: true),
                containerTemplate(name: 'helm', image: 'lachlanevenson/k8s-helm:latest', command: 'cat', ttyEnabled: true),
                containerTemplate(name: 'yq', image: 'mikefarah/yq', command: 'cat', ttyEnabled: true),
                containerTemplate(name: 'httpie', image: 'blacktop/httpie', command: 'cat', ttyEnabled: true)
        ],
        imagePullSecrets: ["regcred"],
        volumes: [
                hostPathVolume(hostPath: '/var/run/docker.sock', mountPath: '/var/run/docker.sock'),
                secretVolume(mountPath: '/etc/.dockercreds', secretName: 'docker-creds'),
                hostPathVolume(mountPath: '/go/pkg/mod', hostPath: '/tmp/jenkins/go')
        ]
) {

    node("${label}") {
        def srvRepo = "quay.io/reportportal/service-ui"
        def srvVersion = "BUILD-${env.BUILD_NUMBER}"
        def tag = "$srvRepo:$srvVersion"

        /**
         * General ReportPortal Kubernetes Configuration and Helm Chart
         */
        def k8sDir = "kubernetes"
        def k8sChartDir = "$k8sDir/reportportal/v5"

        /**
         * Jenkins utilities and environment Specific k8s configuration
         */
        def ciDir = "reportportal-ci"
        def appDir = "app"

        parallel 'Checkout Infra': {
            stage('Checkout Infra') {
                sh 'mkdir -p ~/.ssh'
                sh 'ssh-keyscan -t rsa github.com >> ~/.ssh/known_hosts'
                sh 'ssh-keyscan -t rsa git.epam.com >> ~/.ssh/known_hosts'
                dir(k8sDir) {
                    git branch: "master", url: 'https://github.com/reportportal/kubernetes.git'

                }
                dir(ciDir) {
                    git credentialsId: 'epm-gitlab-key', branch: "master", url: 'git@git.epam.com:epmc-tst/reportportal-ci.git'
                }

            }
        }, 'Checkout Service': {
            stage('Checkout Service') {
                dir(appDir) {
                    checkout scm
                }
            }
        }
        def test = load "${ciDir}/jenkins/scripts/test.groovy"
        def utils = load "${ciDir}/jenkins/scripts/util.groovy"
        def helm = load "${ciDir}/jenkins/scripts/helm.groovy"
        def docker = load "${ciDir}/jenkins/scripts/docker.groovy"

        docker.init()
        helm.init()
        utils.scheduleRepoPoll()

        dir(appDir) {
            parallel 'Build UI': {
                dir('app') {
                    container('nodejs') {
                        stage('Install Deps') {
                            sh "npm install"
                        }
                        stage('Build App') {
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

            stage('Build Docker Image') {
                container('docker') {
                    sh "docker build -f Dockerfile-k8s -t quay.io/reportportal/service-ui:BUILD-${env.BUILD_NUMBER} ."
                    sh "docker push quay.io/reportportal/service-ui:BUILD-${env.BUILD_NUMBER}"
                }
            }
        }


        stage('Deploy to Dev') {
            def valsFile = "merged.yml"
            container('yq') {
                sh "yq m -x $k8sChartDir/values.yaml $ciDir/rp/values-ci.yml > $valsFile"
            }

            container('helm') {
                dir(k8sChartDir) {
                    sh 'helm dependency update'
                }
                sh "helm upgrade --reuse-values --set serviceui.repository=$srvRepo --set serviceui.tag=$srvVersion --wait -f $valsFile reportportal ./$k8sChartDir"
            }
        }
    }

}
