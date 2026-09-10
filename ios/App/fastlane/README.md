fastlane documentation
----

# FunFunSpell iOS lanes

Prefer `./build.sh` so Capacitor syncs the Xcode project and `package.json` version
is applied (`major*100000 + minor*1000 + patch` → `CFBundleVersion`).

```sh
./build.sh beta_ios        # TestFlight
./build.sh release_ios     # metadata + binary (SUBMIT_FOR_REVIEW defaults false)
./build.sh submit_ios      # upload + submit for review
./build.sh metadata_ios    # store listing metadata from fastlane/metadata (no IPA)
SKIP_SCREENSHOTS=false ./build.sh metadata_ios   # include fastlane/screenshots
SKIP_BUILD=true ./build.sh submit_ios   # reuse tmp/App.ipa
```

Env: copy `env.example` → `.env` (this folder) and/or fill repo-root `.env`.
See `env.example` for `SUBMIT_FOR_REVIEW`, `SKIP_SCREENSHOTS`, `SKIP_BUILD`, optional ASC API key.

Metadata and screenshots are read from `fastlane/metadata` and `fastlane/screenshots` (locale subfolders). 6.9″ screenshots (1320×2868) are detected by resolution — no `APP_IPHONE_67` subfolders needed.

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

Build, upload metadata + binary to App Store Connect. SUBMIT_FOR_REVIEW defaults to false.

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
