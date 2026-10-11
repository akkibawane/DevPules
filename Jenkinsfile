pipeline {
    agent any

    environment {
        JAVA_HOME = tool 'JDK21'
        MAVEN_HOME = tool 'M3'
        PATH = "${env.JAVA_HOME}/bin:${env.MAVEN_HOME}/bin:${env.PATH}"
        DEVPULSE_WEBHOOK = 'http://localhost:8080/api/v1/webhooks/jenkins'
    }

    stages {
        stage('Checkout') {
            steps {
                echo 'Checking out source repository...'
                checkout scm
            }
        }

        stage('Backend Build & Test') {
            steps {
                dir('backend') {
                    sh 'mvn clean test'
                }
            }
        }

        stage('Frontend Lint & Build') {
            steps {
                dir('frontend') {
                    sh 'npm ci'
                    sh 'npm run build'
                }
            }
        }

        stage('Docker Image Build') {
            steps {
                sh 'docker build -t devpulse/backend:latest ./backend'
                sh 'docker build -t devpulse/frontend:latest ./frontend'
            }
        }
    }

    post {
        always {
            // Post build telemetry back to DevPulse platform
            sh """
                curl -X POST '${env.DEVPULSE_WEBHOOK}' \
                  -H 'Content-Type: application/json' \
                  -d '{"jobName":"${env.JOB_NAME}","buildNumber":"${env.BUILD_NUMBER}","status":"${currentBuild.currentResult}","durationSeconds":"${currentBuild.duration / 1000}","branch":"${env.GIT_BRANCH}"}' \
                  || true
            """
        }
        success {
            echo 'Pipeline completed successfully!'
        }
        failure {
            echo 'Pipeline failed! Alert dispatched to DevPulse.'
        }
    }
}
