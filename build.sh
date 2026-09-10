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

# Load .env files without clobbering vars already in the environment.
load_env_file() {
  local file="$1"
  [[ -f "${file}" ]] || return 0

  local line key value
  while IFS= read -r line || [[ -n "${line}" ]]; do
    line="${line#"${line%%[![:space:]]*}"}"
    line="${line%"${line##*[![:space:]]}"}"
    [[ -z "${line}" || "${line}" == \#* ]] && continue

    key="${line%%=*}"
    value="${line#*=}"
    key="${key%"${key##*[![:space:]]}"}"
    value="${value#"${value%%[![:space:]]*}"}"
    value="${value%"${value##*[![:space:]]}"}"
    value="${value#\"}"
    value="${value%\"}"
    value="${value#\'}"
    value="${value%\'}"

    [[ -z "${key}" ]] && continue
    if [[ -z "${!key:-}" ]]; then
      export "${key}=${value}"
    fi
  done < "${file}"
}

load_env_file "${ROOT_DIR}/.env"

load_ios_env() {
  load_env_file "${ROOT_DIR}/ios/App/fastlane/.env"
}

load_android_env() {
  load_env_file "${ROOT_DIR}/android/fastlane/.env"
}

usage() {
  cat <<'EOF'
Usage:
  ./build.sh <command>

Commands:
  build_firebase
  release_web_uat
  release_web_prod
  test_ios
  beta_ios          TestFlight (capacitor + set_version + fastlane beta)
  release_ios       App Store: submit + auto-release after Apple approval
  submit_ios        Upload + submit for App Store review (auto-release after approval)
  metadata_ios      Store listing metadata from ios/App/fastlane/metadata (no IPA)
  buildAndroidApk
  build_android       AAB only (capacitor + fastlane build)
  beta_android        Internal testing (draft; PLAY_TRACK configurable)
  release_android     New AAB → production draft (upload_production)
  promote_android     Promote internal → production (no rebuild)
  metadata_android    Store listing + changelogs (no binary)
  validate_android    Play validate_only dry run
  help

iOS env (repo-root .env or ios/App/fastlane/.env — see ios/App/fastlane/env.example):
  APPLE_ID_APP_USERNAME   Apple ID (required unless using a complete ASC API key)
  SKIP_BUILD=true        Reuse tmp/App.ipa; skip ionic capacitor + gym
  SUBMIT_FOR_REVIEW      Default true on release_ios
  AUTOMATIC_RELEASE      Default true — live after Apple approval (no extra click)
  SKIP_SCREENSHOTS=false Include screenshots on metadata_ios / release_ios (default: true = skip)

Android env (repo-root .env or android/fastlane/.env — see android/fastlane/env.example):
  ESL_IONIC_KEYSTORE_PASSWORD   Signing (required for AAB/APK builds)
  GCLOUD_SERVICE_ACCOUNT_KEY    Play JSON key path (or PLAY_STORE_JSON_KEY)
  SKIP_BUILD=true               Reuse existing AAB; skip ionic capacitor + gradle
  PLAY_TRACK                    beta/validate track (default: internal)
  PLAY_RELEASE_STATUS           beta/validate status (default: draft)
  PLAY_PRODUCTION_STATUS        upload_production / promote status (default: draft)
  SKIP_UPLOAD_METADATA=true     binary-only upload (default: false = push listing)
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

require_apple_id() {
  if [[ -n "${APPLE_ID_APP_USERNAME:-}" || -n "${APPLE_ID:-}" || -n "${FASTLANE_USER:-}" ]]; then
    return 0
  fi

  local key_id issuer_id key_path key_content
  key_id="${APP_STORE_CONNECT_API_KEY_ID:-${ASC_KEY_ID:-}}"
  issuer_id="${APP_STORE_CONNECT_API_ISSUER_ID:-${ASC_ISSUER_ID:-}}"
  key_path="${APP_STORE_CONNECT_API_KEY_PATH:-${ASC_KEY_PATH:-}}"
  key_content="${APP_STORE_CONNECT_API_KEY_CONTENT:-${ASC_KEY_CONTENT:-}}"

  if [[ -n "${key_id}" && -n "${issuer_id}" && ( -n "${key_content}" || ( -n "${key_path}" && -f "${key_path}" ) ) ]]; then
    return 0
  fi

  if [[ -n "${key_id}" || -n "${issuer_id}" || -n "${key_path}" || -n "${key_content}" ]]; then
    die "Incomplete App Store Connect API key: set key id, issuer id, and key path or content (APP_STORE_CONNECT_API_KEY_* or ASC_*)"
  fi

  die "Set APPLE_ID_APP_USERNAME (or APPLE_ID / FASTLANE_USER) in .env, or configure a complete App Store Connect API key"
}

ios_fastlane() {
  pushd "${ROOT_DIR}/ios/App" >/dev/null
  fastlane "$@"
  popd >/dev/null
}

# Capacitor sync + CFBundleVersion from package.json (unless SKIP_BUILD=true).
prepare_ios_native() {
  setVersion
  if skip_build; then
    echo "SKIP_BUILD=true — skipping ionic capacitor build (reusing tmp/App.ipa)"
    return
  fi
  ionic capacitor build ios --configuration production --no-open
  ios_fastlane set_version version:"${VERSION}" build_number:"${ANDROID_VERSION}"
}

# Capacitor sync only (unless SKIP_BUILD=true). versionCode is written by fastlane build via gradle.
prepare_android_native() {
  setVersion
  if skip_build; then
    echo "SKIP_BUILD=true — skipping ionic capacitor build (reusing existing AAB)"
    return
  fi
  ionic cap build android --configuration production --no-open
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

beta_ios() {
  load_ios_env
  require_apple_id
  prepare_ios_native
  ios_fastlane beta
}

release_ios() {
  load_ios_env
  require_apple_id
  prepare_ios_native
  ios_fastlane release
}

submit_ios() {
  load_ios_env
  require_apple_id
  prepare_ios_native
  ios_fastlane submit
}

metadata_ios() {
  load_ios_env
  require_apple_id
  setVersion
  ios_fastlane metadata
}

test_ios() {
  load_ios_env
  setVersion
  ionic capacitor build ios --configuration production
  pushd "${ROOT_DIR}/ios/App" >/dev/null
  fastlane set_version version:"${VERSION}" build_number:"${ANDROID_VERSION}"
  popd >/dev/null
}

buildAndroidApk() {
  load_android_env
  require_env "ESL_IONIC_KEYSTORE_PASSWORD"

  ionic cap build android --configuration production --no-open
  android_fastlane build_apk
}

build_android() {
  load_android_env
  require_env "ESL_IONIC_KEYSTORE_PASSWORD"
  prepare_android_native
  android_fastlane build
}

beta_android() {
  load_android_env
  require_env "ESL_IONIC_KEYSTORE_PASSWORD"
  require_play_key
  prepare_android_native
  android_fastlane beta
}

release_android() {
  load_android_env
  require_env "ESL_IONIC_KEYSTORE_PASSWORD"
  require_play_key
  prepare_android_native
  PLAY_PRODUCTION_STATUS="${PLAY_PRODUCTION_STATUS:-draft}" \
    android_fastlane upload_production
}

promote_android() {
  load_android_env
  require_play_key
  setVersion
  android_fastlane promote
}

metadata_android() {
  load_android_env
  require_play_key
  setVersion
  android_fastlane metadata
}

validate_android() {
  load_android_env
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
    build_firebase|release_web_uat|release_web_prod|test_ios|beta_ios|release_ios|submit_ios|metadata_ios|buildAndroidApk|build_android|beta_android|release_android|promote_android|metadata_android|validate_android)
      "$cmd" "$@"
      ;;
    *)
      usage
      die "unknown command: ${cmd}"
      ;;
  esac
}

main "$@"
