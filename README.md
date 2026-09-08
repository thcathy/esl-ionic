# FunFunSpell Dictation Ionic App (ios, android, web) [![CircleCI](https://circleci.com/gh/thcathy/esl-ionic/tree/master.svg?style=svg)](https://circleci.com/gh/thcathy/esl-ionic/tree/master)

This is the funfunspell dictation app

* [Play Store](https://play.google.com/store/apps/details?id=com.esl.ionic)
* [App Store](https://itunes.apple.com/hk/app/funfunspell-dictation/id1364341686)

## Android release (Fastlane)

Same lane names as Earn Time To Play: `beta` (internal testing), `release` (promote or upload AAB), `promote`, `metadata`, `validate`. FunFunSpell is Capacitor/Ionic — run Capacitor via `./build.sh`, not Flutter.

```bash
# One-time: copy android/fastlane/env.example → android/fastlane/.env
# (or keep using repo-root .env with GCLOUD_SERVICE_ACCOUNT_KEY)

./build.sh beta_android         # Internal testing (draft)
./build.sh release_android      # New AAB → production draft (does not submit for review)
./build.sh promote_android      # Promote internal → production (no rebuild)
./build.sh metadata_android     # Listing + changelogs only
./build.sh validate_android     # Play validate_only dry run
SKIP_BUILD=true ./build.sh beta_android   # reuse existing AAB
```

`release_android` maps to `fastlane android release` with `PLAY_UPLOAD_AAB=true`. Direct `fastlane android release` **promotes** (Earn Time). `PLAY_PRODUCTION_STATUS` defaults to **draft** so a normal release does not submit for Google review. Set `PLAY_PRODUCTION_STATUS=completed` when you intend to submit.

`versionCode` is still `major*100000 + minor*1000 + patch` from `package.json`. Changelogs still come from `release_notes/{en,zh-Hant,zh-Hans}.txt`.

## Major Dependency
* [Ionic framework](https://ionicframework.com/): application framework
* [Angular](https://angular.io/): application framework
* [Font Awesome](https://fontawesome.com/): vector icons
* [auth0](https://auth0.com): authentication and authorization

## Sponsor
![Jetbrains](assets/images/jetbrains-variant-4.png)
   
* [JetBrains]( https://www.jetbrains.com/?from=esl-ionic ): Best IDE ever

![browserstack](assets/images/Browserstack-logo.png)

* [Browserstack](https://www.browserstack.com/): App and Browser Testing Made Easy


