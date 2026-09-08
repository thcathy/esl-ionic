# FunFunSpell Dictation Ionic App (ios, android, web) [![CircleCI](https://circleci.com/gh/thcathy/esl-ionic/tree/master.svg?style=svg)](https://circleci.com/gh/thcathy/esl-ionic/tree/master)

This is the funfunspell dictation app

* [Play Store](https://play.google.com/store/apps/details?id=com.esl.ionic)
* [App Store](https://itunes.apple.com/hk/app/funfunspell-dictation/id1364341686)

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
./build.sh release_ios      # App Store metadata + IPA (does not submit for review)
./build.sh submit_ios        # upload + submit for review
./build.sh metadata_ios     # What's New only
SKIP_BUILD=true ./build.sh submit_ios   # reuse tmp/App.ipa
```

`release_ios` maps to `fastlane ios release`. `SUBMIT_FOR_REVIEW` defaults to **false** so a normal release does not send the app to Apple review. Set `SUBMIT_FOR_REVIEW=true` or use `submit_ios` when you intend to submit.

CFBundleVersion is still `major*100000 + minor*1000 + patch` from `package.json`. Signing stays Xcode Automatic Signing (no match).

## Sponsor
![Jetbrains](assets/images/jetbrains-variant-4.png)
   
* [JetBrains]( https://www.jetbrains.com/?from=esl-ionic ): Best IDE ever

![browserstack](assets/images/Browserstack-logo.png)

* [Browserstack](https://www.browserstack.com/): App and Browser Testing Made Easy


