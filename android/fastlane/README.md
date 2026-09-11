fastlane documentation
----

# FunFunSpell Android lanes

Prefer `./build.sh` so Capacitor syncs the Android project and `package.json`
version is applied (`major*100000 + minor*1000 + patch` → `versionCode`).

```sh
./build.sh beta_android          # Internal testing (draft)
./build.sh release_android       # New AAB → production; auto-publish after Google review
./build.sh promote_android       # internal → production, no rebuild
./build.sh metadata_android      # listing + changelogs (no binary)
./build.sh validate_android      # Play validate_only dry run
./build.sh build_android         # AAB only
SKIP_BUILD=true ./build.sh beta_android   # reuse existing AAB
```

Env: copy `env.example` → `.env` (this folder) and/or fill repo-root `.env`.
See `env.example` for `PLAY_TRACK`, `PLAY_RELEASE_STATUS`, `PLAY_PRODUCTION_STATUS`,
`PLAY_UPLOAD_AAB`, `SKIP_BUILD`, `SKIP_UPLOAD_METADATA` (default **false** — listing
text uploads unless you opt out), `GCLOUD_SERVICE_ACCOUNT_KEY` / `PLAY_STORE_JSON_KEY`.

`fastlane android release` promotes by default (Earn Time). `./build.sh release_android`
sets `PLAY_UPLOAD_AAB=true` and `PLAY_PRODUCTION_STATUS=completed` so Google review
is submitted and the app goes live after approval (Play Console → Publishing overview
→ Managed publishing **OFF**). Override with `PLAY_PRODUCTION_STATUS=draft` for a
Console-held draft.

Direct Fastlane (after `ionic cap build android --configuration production --no-open`):

# Installation

Make sure you have the latest version of the Xcode command line tools installed:

```sh
xcode-select --install
```

For _fastlane_ installation instructions, see [Installing _fastlane_](https://docs.fastlane.tools/#installing-fastlane)

# Available Actions

## Android

### android set_version

```sh
[bundle exec] fastlane android set_version
```

Set version name and code in build.gradle (defaults from `package.json`)

### android build_apk

```sh
[bundle exec] fastlane android build_apk
```

Build, sign and copy release APK

### android build_bundle

```sh
[bundle exec] fastlane android build_bundle
```

Build signed release AAB (deprecated — use `build`)

### android build

```sh
[bundle exec] fastlane android build
```

Build release AAB only (no upload). SKIP_BUILD=true reuses the existing AAB.

### android validate

```sh
[bundle exec] fastlane android validate
```

Validate Play Store metadata + AAB (dry run, no upload)

### android metadata

```sh
[bundle exec] fastlane android metadata
```

Upload store listing metadata only (no binary). Listing files are optional.

### android beta

```sh
[bundle exec] fastlane android beta
```

Build and upload to Google Play Internal Testing (PLAY_TRACK, draft by default)

### android upload_production

```sh
[bundle exec] fastlane android upload_production
```

Build and upload new AAB to production (PLAY_PRODUCTION_STATUS defaults to draft)

### android release

```sh
[bundle exec] fastlane android release
```

Promote internal → production (PLAY_PRODUCTION_STATUS defaults to draft)

### android promote

```sh
[bundle exec] fastlane android promote
```

Promote latest internal/closed build to production (no rebuild)

### android upload

```sh
[bundle exec] fastlane android upload
```

Upload AAB to Play Store (legacy). Prefer beta or upload_production.

----

This README.md is auto-generated and will be re-generated every time [_fastlane_](https://fastlane.tools) is run.

More information about _fastlane_ can be found on [fastlane.tools](https://fastlane.tools).

The documentation of _fastlane_ can be found on [docs.fastlane.tools](https://docs.fastlane.tools).
