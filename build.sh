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
  XCARCHIVE_PATH="ESL.xcarchive"
  EXPORT_PATH="./tmp"

  if [ -z "$APPLE_ID_APP_USERNAME" ]; then
   echo "APPLE_ID_APP_USERNAME is not set"
   exit 1
  fi

  if [ -z "$APPLE_ID_APP_PASSWORD" ]; then
   echo "APPLE_ID_APP_PASSWORD is not set"
   exit 1
  fi

  setVersion
  sed -i '' "s/MARKETING_VERSION = .*;/MARKETING_VERSION = $VERSION;/g" ios/App/App.xcodeproj/project.pbxproj
  ionic capacitor build ios --prod --no-open
  cd ios/App
  xcodebuild archive -workspace App.xcworkspace -archivePath $XCARCHIVE_PATH -scheme App -destination generic/platform=iOS
  xcodebuild -exportArchive -archivePath $XCARCHIVE_PATH -exportPath ${EXPORT_PATH}  -exportOptionsPlist ExportOptions.plist -allowProvisioningUpdates
  xcrun altool --upload-app -t ios -f ${EXPORT_PATH}/App.ipa -u ${APPLE_ID_APP_USERNAME} -p "${APPLE_ID_APP_PASSWORD}"
  rm -Rf ${XCARCHIVE_PATH}
  rm -Rf ${EXPORT_PATH}
}

testios() {
  setVersion
  sed -i '' "s/MARKETING_VERSION = .*;/MARKETING_VERSION = $VERSION;/g" ios/App/App.xcodeproj/project.pbxproj
  ionic capacitor build ios --prod
}

buildAndroidApk() {
  if [ -z "$ESL_IONIC_KEYSTORE_PASSWORD" ]; then
   echo "ESL_IONIC_KEYSTORE_PASSWORD is not set"
   exit 1
  fi

  ionic cap build android --prod --no-open
  jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore my-release-key.jks -storepass ${ESL_IONIC_KEYSTORE_PASSWORD} android/app/build/outputs/apk/release/app-release-unsigned.apk esl-dictation
  rm -f esl-dictation.apk
  /Users/thcathy/Library/Android/sdk/build-tools/28.0.3/zipalign -v 4 platforms/android/app/build/outputs/apk/release/app-release-unsigned.apk esl-dictation.apk
  cp esl-dictation.apk ~/Google\ Drive/apk/
}

buildAndroidAab() {
  AAB_PATH="app/build/outputs/bundle/release/app-release.aab"

  if [ -z "$ESL_IONIC_KEYSTORE_PASSWORD" ]; then
   echo "ESL_IONIC_KEYSTORE_PASSWORD is not set"
   exit 1
  fi

  if [ -z "$GCLOUD_SERVICE_ACCOUNT_KEY" ]; then
   echo "GCLOUD_SERVICE_ACCOUNT_KEY is not set"
   exit 1
  fi

  setVersion
  ionic cap build android --prod --no-open
  cd android
  sed -i ''  "s/versionName \".*\"/versionName \"$VERSION\"/g" app/build.gradle
  sed -i ''  "s/versionCode .*/versionCode $ANDROID_VERSION/g" app/build.gradle
  ./gradlew bundle
  jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore ../my-release-key.jks -storepass ${ESL_IONIC_KEYSTORE_PASSWORD} ${AAB_PATH} esl-dictation
  fastlane supply -f ${AAB_PATH} --track "production" --skip_upload_images --skip_upload_screenshots --skip_upload_metadata --release_status "draft" --json_key ${GCLOUD_SERVICE_ACCOUNT_KEY}
}

setVersion() {
  VERSION=`cat package.json | python3 -c "import sys, json; print(json.load(sys.stdin)['version'])"`
  ANDROID_VERSION=`echo $VERSION | tr . 0`
  echo "set version=$VERSION, android versionCode=$ANDROID_VERSION"
}

"$@"
