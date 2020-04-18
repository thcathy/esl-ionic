set -e

deployWebUAT() {
  firebase deploy -P batch4-161201
}

deployWebProd() {
  firebase deploy -P funfunspell-firebase
}

buildFirebase() {
  ionic build --prod
}

buildios() {
 ionic cordova build ios --prod
}

buildAndroidApk() {
  export JAVA_HOME=/Library/Java/JavaVirtualMachines/jdk1.8.0_192.jdk/Contents/Home
  ionic cordova build android --prod --release
  jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore my-release-key.jks  -storepass funfunspell platforms/android/app/build/outputs/apk/release/app-release-unsigned.apk esl-dictation
  rm -f esl-dictation.apk
  /Users/thcathy/Library/Android/sdk/build-tools/28.0.3/zipalign -v 4 platforms/android/app/build/outputs/apk/release/app-release-unsigned.apk esl-dictation.apk
  cp esl-dictation.apk ~/Google\ Drive/apk/
}

buildAndroidAab() {
  export JAVA_HOME=/Library/Java/JavaVirtualMachines/jdk1.8.0_192.jdk/Contents/Home
  ionic cordova build android --prod
  cd platforms/android
  ./gradlew bundle
  cd ../..
  jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore my-release-key.jks -storepass funfunspell platforms/android/app/build/outputs/bundle/release/app.aab esl-dictation
}

simios() {
 ionic cordova emulate ios -lc
}

deployWeb() {
  firebase deploy
}

buildWebAndDeploy() {
  buildiWebProd;
  deployWeb;
}

"$@"
