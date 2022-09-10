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
  setVersion
  sed -i '' "s/MARKETING_VERSION = .*;/MARKETING_VERSION = $VERSION;/g" ios/App/App.xcodeproj/project.pbxproj
  ionic capacitor build ios --prod  
}

buildAndroidApk() {
  ionic cap build android --prod --no-open
  jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore my-release-key.jks  -storepass funfunspell android/app/build/outputs/apk/release/app-release-unsigned.apk esl-dictation
  rm -f esl-dictation.apk
  /Users/thcathy/Library/Android/sdk/build-tools/28.0.3/zipalign -v 4 platforms/android/app/build/outputs/apk/release/app-release-unsigned.apk esl-dictation.apk
  cp esl-dictation.apk ~/Google\ Drive/apk/
}

buildAndroidAab() {
  setVersion  
  ionic cap build android --prod --no-open
  cd android
  sed -i ''  "s/versionName \".*\"/versionName \"$VERSION\"/g" app/build.gradle
  ./gradlew bundle
  cd ..
  jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore my-release-key.jks -storepass funfunspell android/app/build/outputs/bundle/release/app-release.aab esl-dictation
}

simios() {
 ionic cordova emulate ios -lc
}

setVersion() {
  VERSION=`cat package.json | python3 -c "import sys, json; print(json.load(sys.stdin)['version'])"`
  echo "set version=$VERSION"
}

"$@"
