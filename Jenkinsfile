pipeline {
    agent any

    tools {
      nodejs 'NodeJs Environment'
    }

    options {
      skipDefaultCheckout(true)
    }

    stages{
        stage("Checkout") {
            steps {
                script {
                    def gitVars = checkout scm
                    COMMIT_ID = gitVars.GIT_COMMIT
                    echo "The commit ID is ${COMMIT_ID}"
                }
            }
        }

        stage("SonarQube Analysis") {
            steps {
                script {
                  def scannerHome = tool 'SonarQube-Scanner';
                  withSonarQubeEnv('SonarQube-Server') {
                    sh "${tool("SonarQube-Scanner")}/bin/sonar-scanner -Dsonar.projectKey=Family-Backend"
                  }
                }
            }
        }

        stage("Build Docker Images") {
            steps {
                script {
                  sh "docker compose build"
                }
            }
        }

        stage("Push Docker Images to Docker Hub") {
            steps {
                script {
                    withCredentials([usernamePassword(credentialsId: 'Dockerhub Credentials', usernameVariable: 'USERNAME', passwordVariable: 'PASSWORD')]) {
                        sh "echo ${PASSWORD} | docker login --username ${USERNAME} --password-stdin"
                        sh "docker compose -f docker-compose.yml push"
                    }
                }
            }
        }

        stage("Pull Images from Docker Hub") {
          steps {
            sh "sudo ssh banhhaotoan2002@35.194.225.250 'touch test.txt'"
          }
        }

        stage("Deploy to Kubernetes") {
          steps {
                sh "echo Deploy"
          }
        }
    }
}
