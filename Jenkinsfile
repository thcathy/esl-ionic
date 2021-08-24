pipeline {
  agent {
    docker {
      args '-v $HOME/.npm:/root/utils-ionic-v4-npm'
      image 'zenika/alpine-chrome:with-node'
    }
  }

  stages {
    stage('build and test') {
      steps {
        sh 'npm ci'
        sh 'npx ionic build --prod'
        sh 'npm run test-ci'
      }
      post {
        always { junit 'src/TESTS*.xml' }
      }
    }

    stage('deploy to firebase') {
      when { branch 'master' }
      environment {
        FIREBASE_DEPLOY_KEY = credentials('FIREBASE_DEPLOY_KEY')
      }
      steps {
        sh 'npm install firebase-tools'
        sh 'npx firebase deploy --token ${FIREBASE_DEPLOY_KEY}'
      }
    }

  }
}
