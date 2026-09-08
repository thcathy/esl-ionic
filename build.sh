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
  build_android       AAB only (capacitor + set_version + fastlane build)
  beta_android        Internal testing (draft; PLAY_TRACK configurable)
  release_android     New AAB → production draft (PLAY_UPLOAD_AAB=true)
  promote_android     Promote internal → production (no rebuild)
  metadata_android    Store listing + changelogs (no binary)
  validate_android    Play validate_only dry run
  help

Android env (repo-root .env or android/fastlane/.env — see android/fastlane/env.example):
  ESL_IONIC_KEYSTORE_PASSWORD   Signing (required for AAB/APK builds)
  GCLOUD_SERVICE_ACCOUNT_KEY    Play JSON key path (or PLAY_STORE_JSON_KEY)
  SKIP_BUILD=true               Reuse existing AAB; skip ionic capacitor + gradle
  PLAY_TRACK                    beta/validate track (default: internal)
  PLAY_RELEASE_STATUS           beta/validate status (default: draft)
  PLAY_PRODUCTION_STATUS        release/promote status (default: draft)
  PLAY_UPLOAD_AAB=true          release lane: upload a new AAB instead of promoting
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

skip_build() {
  [[ "${SKIP_BUILD:-false}" == "true" ]]
}

require_play_key() {
  if [[ -z "${GCLOUD_SERVICE_ACCOUNT_KEY:-}" && -z "${PLAY_STORE_JSON_KEY:-}" ]]; then
    die "Set GCLOUD_SERVICE_ACCOUNT_KEY (or PLAY_STORE_JSON_KEY) to the Play Console JSON key path"
  fi
}

android_fastlane() {
  pushd "${ROOT_DIR}/android" >/dev/null
  fastlane "$@"
  popd >/dev/null
}

# Capacitor sync + versionCode from package.json (unless SKIP_BUILD=true).
prepare_android_native() {
  setVersion
  if skip_build; then
    echo "SKIP_BUILD=true — skipping ionic capacitor build (reusing existing AAB)"
    return
  fi
  ionic cap build android --configuration production --no-open
  android_fastlane set_version version:"${VERSION}" version_code:"${ANDROID_VERSION}"
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
  android_fastlane build_apk
}

build_android() {
  require_env "ESL_IONIC_KEYSTORE_PASSWORD"
  prepare_android_native
  android_fastlane build
}

beta_android() {
  require_env "ESL_IONIC_KEYSTORE_PASSWORD"
  require_play_key
  prepare_android_native
  android_fastlane beta
}

release_android() {
  # Historic FFS: new signed AAB → production as draft.
  # Fastlane `release` promotes unless PLAY_UPLOAD_AAB=true (Earn Time default).
  require_env "ESL_IONIC_KEYSTORE_PASSWORD"
  require_play_key
  prepare_android_native
  PLAY_UPLOAD_AAB="${PLAY_UPLOAD_AAB:-true}" \
    PLAY_PRODUCTION_STATUS="${PLAY_PRODUCTION_STATUS:-draft}" \
    android_fastlane release
}

promote_android() {
  require_play_key
  setVersion
  android_fastlane promote
}

metadata_android() {
  require_play_key
  setVersion
  android_fastlane metadata
}

validate_android() {
  require_env "ESL_IONIC_KEYSTORE_PASSWORD"
  require_play_key
  prepare_android_native
  android_fastlane validate
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
    build_firebase|release_web_uat|release_web_prod|test_ios|release_ios|buildAndroidApk|build_android|beta_android|release_android|promote_android|metadata_android|validate_android)
      "$cmd" "$@"
      ;;
    *)
      usage
      die "unknown command: ${cmd}"
      ;;
  esac
}

main "$@"
