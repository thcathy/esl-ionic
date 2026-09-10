# FunFunSpell Dictation Ionic App (ios, android, web) [![CircleCI](https://circleci.com/gh/thcathy/esl-ionic/tree/master.svg?style=svg)](https://circleci.com/gh/thcathy/esl-ionic/tree/master)

This is the funfunspell dictation app

* [Play Store](https://play.google.com/store/apps/details?id=com.esl.ionic)
* [App Store](https://itunes.apple.com/hk/app/funfunspell-dictation/id1364341686)

## Android release (Fastlane)

Same lane names as Earn Time To Play: `beta` (internal testing), `release` (promote), `upload_production` (new AAB), `promote`, `metadata`, `validate`. FunFunSpell is Capacitor/Ionic — run Capacitor via `./build.sh`, not Flutter.

```bash
# One-time: copy android/fastlane/env.example → android/fastlane/.env
# (or keep using repo-root .env with GCLOUD_SERVICE_ACCOUNT_KEY)

./build.sh beta_android         # Internal testing (draft)
./build.sh release_android      # New AAB → production; live after Google review
./build.sh promote_android      # Promote internal → production (no rebuild)
./build.sh metadata_android     # Listing + changelogs only
./build.sh validate_android     # Play validate_only dry run
SKIP_BUILD=true ./build.sh beta_android   # reuse existing AAB
```

`release_android` maps to `fastlane android upload_production`. `promote_android` and direct `fastlane android release` **promote** internal → production (no rebuild). `PLAY_PRODUCTION_STATUS` defaults to **draft** so a normal release does not submit for Google review. Set `PLAY_PRODUCTION_STATUS=completed` when you intend to submit.

`versionCode` is still `major*100000 + minor*1000 + patch` from `package.json`. Changelogs still come from `release_notes/{en,zh-Hant,zh-Hans}.txt`. Play listing copy lives under `android/fastlane/metadata/android` and **uploads with beta/release/upload by default**; set `SKIP_UPLOAD_METADATA=true` for a binary-only upload.

## Major Dependency
* [Ionic framework](https://ionicframework.com/): application framework
* [Angular](https://angular.io/): application framework
* [Font Awesome](https://fontawesome.com/): vector icons
* [auth0](https://auth0.com): authentication and authorization

## iOS release (Fastlane)

Same lane names as Earn Time To Play: `beta` (TestFlight), `release` (metadata + binary), `submit`, `metadata`. FunFunSpell is Capacitor/Ionic — run Capacitor via `./build.sh`, not Flutter.

```bash
# One-time: copy ios/App/fastlane/env.example → ios/App/fastlane/.env
# (or keep using repo-root .env with APPLE_ID_APP_USERNAME)

./build.sh beta_ios          # TestFlight
./build.sh release_ios      # App Store: submit + auto-release after Apple approval
./build.sh submit_ios        # upload + submit (auto-release after Apple approval)
./build.sh metadata_ios     # store listing metadata from ios/App/fastlane/metadata (no IPA)
SKIP_SCREENSHOTS=false ./build.sh metadata_ios   # include screenshots from ios/App/fastlane/screenshots
SKIP_BUILD=true ./build.sh submit_ios   # reuse tmp/App.ipa
```

`release_ios` maps to `fastlane ios release`. `SUBMIT_FOR_REVIEW` and `AUTOMATIC_RELEASE` default to **true**: Apple reviews the app, then it goes live without an extra App Store Connect click. Set `SUBMIT_FOR_REVIEW=false` to upload without submitting, or `AUTOMATIC_RELEASE=false` to hold after approval.

Store listing text and screenshots live under `ios/App/fastlane/metadata` and `ios/App/fastlane/screenshots`. Deliver detects 6.9″ iPhone screenshots (1320×2868) by resolution — device subfolders like `APP_IPHONE_67` are not required.

CFBundleVersion is still `major*100000 + minor*1000 + patch` from `package.json`. Signing stays Xcode Automatic Signing (no match).

## Sponsor
![Jetbrains](assets/images/jetbrains-variant-4.png)
   
* [JetBrains]( https://www.jetbrains.com/?from=esl-ionic ): Best IDE ever

![browserstack](assets/images/Browserstack-logo.png)

* [Browserstack](https://www.browserstack.com/): App and Browser Testing Made Easy


