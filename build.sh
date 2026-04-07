#!/usr/bin/env bash

set -Eeuo pipefail
IFS=$'\n\t'

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

DEBUG="${DEBUG:-0}"
if [[ "${DEBUG}" == "1" || "${DEBUG}" == "true" ]]; then
  # More informative xtrace (file:line:function) when debugging.
  export PS4='+ ${BASH_SOURCE##*/}:${LINENO}:${FUNCNAME[0]:+${FUNCNAME[0]}(): }'
  set -x
fi

if [[ -f "${ROOT_DIR}/.env" ]]; then
  # shellcheck source=.env
  set -o allexport
  source "${ROOT_DIR}/.env"
  set +o allexport
fi

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
  ionic build --configuration production
}

release_ios() {
  require_env "APPLE_ID_APP_USERNAME"

  setVersion
  ionic capacitor build ios --configuration production --no-open

  pushd "${ROOT_DIR}/ios/App" >/dev/null
  fastlane set_version version:"${VERSION}" build_number:"${ANDROID_VERSION}"
  fastlane build
  fastlane upload ipa:"${ROOT_DIR}/tmp/App.ipa" version:"${VERSION}"
  popd >/dev/null
}

test_ios() {
  setVersion
  ionic capacitor build ios --configuration production
  pushd "${ROOT_DIR}/ios/App" >/dev/null
  fastlane set_version version:"${VERSION}" build_number:"${ANDROID_VERSION}"
  popd >/dev/null
}

buildAndroidApk() {
  require_env "ESL_IONIC_KEYSTORE_PASSWORD"

  ionic cap build android --configuration production --no-open
  pushd "${ROOT_DIR}/android" >/dev/null
  fastlane build_apk
  popd >/dev/null
}

release_android() {
  local AAB_PATH="${ROOT_DIR}/android/app/build/outputs/bundle/release/app-release.aab"

  require_env "ESL_IONIC_KEYSTORE_PASSWORD"
  require_env "GCLOUD_SERVICE_ACCOUNT_KEY"

  setVersion
  ionic cap build android --configuration production --no-open
  pushd "${ROOT_DIR}/android" >/dev/null
  fastlane set_version version:"${VERSION}" version_code:"${ANDROID_VERSION}"
  fastlane build_bundle
  fastlane upload aab:"${AAB_PATH}"
  popd >/dev/null
}

setVersion() {
  VERSION="$(python3 -c "import json,sys; print(json.load(sys.stdin)['version'])" < "${ROOT_DIR}/package.json")"
  local version_core="${VERSION%%-*}"
  local major minor patch
  IFS='.' read -r major minor patch <<< "${version_core}"
  major="${major:-0}"
  minor="${minor:-0}"
  patch="${patch:-0}"

  [[ "${major}" =~ ^[0-9]+$ ]] || die "Invalid major version in package.json: ${VERSION}"
  [[ "${minor}" =~ ^[0-9]+$ ]] || die "Invalid minor version in package.json: ${VERSION}"
  [[ "${patch}" =~ ^[0-9]+$ ]] || die "Invalid patch version in package.json: ${VERSION}"

  # Use monotonically increasing versionCode: M*100000 + m*1000 + p
  # Examples: 9.7.10 -> 907010, 10.0.0 -> 1000000
  ANDROID_VERSION="$(( major * 100000 + minor * 1000 + patch ))"
  echo "set version=${VERSION}, android versionCode=${ANDROID_VERSION}"
}

main() {
  local cmd="${1:-help}"
  shift || true

  echo "==> ${0##*/} ${cmd}" >&2

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
