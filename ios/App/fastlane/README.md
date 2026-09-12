fastlane documentation
----

# FunFunSpell iOS lanes

Prefer `./build.sh` so Capacitor syncs the Xcode project and `package.json` version
is applied (`major*100000 + minor*1000 + patch` → `CFBundleVersion`).

```sh
./build.sh beta_ios        # TestFlight
./build.sh release_ios     # submit + auto-release after Apple approval
./build.sh submit_ios      # upload + submit (auto-release after approval)
./build.sh metadata_ios    # store listing metadata from fastlane/metadata (no IPA)
SKIP_SCREENSHOTS=false ./build.sh metadata_ios   # include fastlane/screenshots
SKIP_BUILD=true ./build.sh submit_ios   # reuse tmp/App.ipa
```

Env: copy `env.example` → `.env` (this folder) and/or fill repo-root `.env`.
See `env.example` for `SUBMIT_FOR_REVIEW` (default true), `AUTOMATIC_RELEASE` (default true), `SKIP_SCREENSHOTS` (default true), `OVERWRITE_SCREENSHOTS` (default true when screenshots are uploaded), `SKIP_BUILD`, optional ASC API key.

Metadata and screenshots are read from `fastlane/metadata` and `fastlane/screenshots` (locale subfolders). 6.9″ iPhone screenshots (1320×2868) are detected by resolution — no `APP_IPHONE_67` subfolders needed. iPad 13″ screenshots (2064×2752) use filenames `APP_IPAD_PRO_3GEN_129-*.png` in the same locale folders alongside iPhone shots.

The `metadata` lane uses `skip_app_version_update: true` — it does **not** create or bump an App Store Connect version. Screenshot and metadata upload require an **editable** ASC iOS version for the `package.json` marketing version. If deliver fails with `Cannot update languages - could not find an editable version for 'IOS'`, create the next draft version in App Store Connect or wait for the next binary upload — do **not** bump `package.json` or reuse an already-submitted version solely for screenshots.

`SKIP_SCREENSHOTS` defaults to true (no screenshot upload on release). When screenshots are uploaded (`SKIP_SCREENSHOTS=false`), `OVERWRITE_SCREENSHOTS` defaults to true so existing ASC wells are replaced.

Re-run screenshot upload:
```sh
SKIP_SCREENSHOTS=false ./build.sh metadata_ios
```

Direct Fastlane (after `ionic capacitor build ios --configuration production --no-open`):

# Installation

Make sure you have the latest version of the Xcode command line tools installed:

```sh
xcode-select --install
```

For _fastlane_ installation instructions, see [Installing _fastlane_](https://docs.fastlane.tools/#installing-fastlane)

# Available Actions

## iOS

### ios set_version

```sh
[bundle exec] fastlane ios set_version
```

Set marketing version and build number in Xcode project (defaults from `package.json`)

### ios build

```sh
[bundle exec] fastlane ios build
```

Build IPA only (no upload). Output: tmp/App.ipa

### ios beta

```sh
[bundle exec] fastlane ios beta
```

Build and upload to TestFlight (does not submit for App Store review)

### ios release

```sh
[bundle exec] fastlane ios release
```

Build, upload metadata + binary, submit for review. AUTOMATIC_RELEASE defaults true (live after Apple approval).

### ios submit

```sh
[bundle exec] fastlane ios submit
```

Upload + submit for review. Builds unless SKIP_BUILD=true. SKIP_BINARY_UPLOAD=true submits the latest ASC build only.

### ios metadata

```sh
[bundle exec] fastlane ios metadata
```

Upload store metadata (name/subtitle/keywords/description/promo/URLs/release notes). Screenshots if SKIP_SCREENSHOTS=false. No binary.

### ios upload

```sh
[bundle exec] fastlane ios upload
```

Upload IPA and create App Store version (legacy two-step: TestFlight wait + deliver). Prefer beta / release.

----

This README.md is auto-generated and will be re-generated every time [_fastlane_](https://fastlane.tools) is run.

More information about _fastlane_ can be found on [fastlane.tools](https://fastlane.tools).

The documentation of _fastlane_ can be found on [docs.fastlane.tools](https://docs.fastlane.tools).
