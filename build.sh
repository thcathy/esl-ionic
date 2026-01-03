#!/usr/bin/env bash

set -Eeuo pipefail
IFS=$'\n\t'

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

usage() {
  cat <<'EOF'
Usage:
  ./build.sh <command>

Commands:
  build_firebase
  release_web_uat
  release_web_prod
  test_ios
  release_ios
  buildAndroidApk
  release_android
  help
EOF
}

die() {
  echo "Error: $*" >&2
  exit 1
}

require_env() {
  local name="$1"
  if [[ -z "${!name:-}" ]]; then
    die "$name is not set"
  fi
}

release_web_uat() {
  firebase deploy -P batch4-161201
}

release_web_prod() {
  firebase deploy -P funfunspell-firebase
}

build_firebase() {
  ionic build --prod
}

release_ios() {
  local XCARCHIVE_PATH="${ROOT_DIR}/ios/App/ESL.xcarchive"
  local EXPORT_PATH="${ROOT_DIR}/tmp"

  require_env "APPLE_ID_APP_USERNAME"
  require_env "APPLE_ID_APP_PASSWORD"

  setVersion
  sed -i '' "s/MARKETING_VERSION = .*;/MARKETING_VERSION = ${VERSION};/g" "${ROOT_DIR}/ios/App/App.xcodeproj/project.pbxproj"
  ionic capacitor build ios --prod --no-open

  pushd "${ROOT_DIR}/ios/App" >/dev/null
  xcodebuild archive -workspace "App.xcworkspace" -archivePath "$XCARCHIVE_PATH" -scheme "App" -destination "generic/platform=iOS"
  xcodebuild -exportArchive -archivePath "$XCARCHIVE_PATH" -exportPath "$EXPORT_PATH" -exportOptionsPlist "ExportOptions.plist" -allowProvisioningUpdates
  xcrun altool --upload-app -t ios -f "${EXPORT_PATH}/App.ipa" -u "$APPLE_ID_APP_USERNAME" -p "$APPLE_ID_APP_PASSWORD"
  popd >/dev/null
}

test_ios() {
  setVersion
  sed -i '' "s/MARKETING_VERSION = .*;/MARKETING_VERSION = ${VERSION};/g" "${ROOT_DIR}/ios/App/App.xcodeproj/project.pbxproj"
  ionic capacitor build ios --prod
}

buildAndroidApk() {
  require_env "ESL_IONIC_KEYSTORE_PASSWORD"

  ionic cap build android --prod --no-open
  pushd "${ROOT_DIR}/android" >/dev/null
  ./gradlew assembleRelease
  popd >/dev/null

  jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore "${ROOT_DIR}/my-release-key.jks" -storepass "${ESL_IONIC_KEYSTORE_PASSWORD}" "${ROOT_DIR}/android/app/build/outputs/apk/release/app-release-unsigned.apk" "esl-dictation"
  rm -f -- "${ROOT_DIR}/esl-dictation.apk"
  "/Users/thcathy/Library/Android/sdk/build-tools/35.0.0/zipalign" -v 4 "${ROOT_DIR}/android/app/build/outputs/apk/release/app-release-unsigned.apk" "${ROOT_DIR}/esl-dictation.apk"
  cp "${ROOT_DIR}/esl-dictation.apk" "${HOME}/Google Drive/My Drive/apk/"
}

release_android() {
  local AAB_PATH="app/build/outputs/bundle/release/app-release.aab"

  require_env "ESL_IONIC_KEYSTORE_PASSWORD"
  require_env "GCLOUD_SERVICE_ACCOUNT_KEY"

  setVersion
  ionic cap build android --prod --no-open
  pushd "${ROOT_DIR}/android" >/dev/null
  sed -i ''  "s/versionName \".*\"/versionName \"${VERSION}\"/g" "app/build.gradle"
  sed -i ''  "s/versionCode .*/versionCode ${ANDROID_VERSION}/g" "app/build.gradle"
#  export JAVA_HOME=`/usr/libexec/java_home -v 17`
  ./gradlew bundle
  jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore "${ROOT_DIR}/my-release-key.jks" -storepass "${ESL_IONIC_KEYSTORE_PASSWORD}" "${AAB_PATH}" "esl-dictation"
  fastlane supply -f "${AAB_PATH}" --package_name "com.esl.ionic" --track "production" --skip_upload_images --skip_upload_screenshots --skip_upload_metadata --release_status "draft" --json_key "${GCLOUD_SERVICE_ACCOUNT_KEY}"
  popd >/dev/null
}

setVersion() {
  VERSION="$(python3 -c "import json,sys; print(json.load(sys.stdin)['version'])" < "${ROOT_DIR}/package.json")"
  ANDROID_VERSION="${VERSION//./0}"
  echo "set version=${VERSION}, android versionCode=${ANDROID_VERSION}"
}

main() {
  local cmd="${1:-help}"
  shift || true

  case "$cmd" in
    help|-h|--help)
      usage
      ;;
    build_firebase|release_web_uat|release_web_prod|test_ios|release_ios|buildAndroidApk|release_android)
      "$cmd" "$@"
      ;;
    *)
      usage
      die "unknown command: $cmd"
      ;;
  esac
}

main "$@"
