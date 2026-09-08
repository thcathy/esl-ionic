# Play Store listing files

Changelogs are generated from repo-root `release_notes/{en,zh-Hant,zh-Hans}.txt`
into these locales before upload:

| Play locale | Source |
| --- | --- |
| en-US, en-GB | `release_notes/en.txt` |
| zh-TW, zh-HK | `release_notes/zh-Hant.txt` |
| zh-CN | `release_notes/zh-Hans.txt` |

Store listing text (title, short description, full description) is optional.
Add files under `{locale}/` when you want `./build.sh metadata_android` to
push them:

- `title.txt`
- `short_description.txt`
- `full_description.txt`

Binary lanes (`beta`, `release` with `PLAY_UPLOAD_AAB=true`, legacy `upload`)
skip listing metadata by default (`SKIP_UPLOAD_METADATA=true`) and still
upload changelogs unless `SKIP_UPLOAD_CHANGELOGS=true`.
Images and screenshots stay skipped unless you set `SKIP_UPLOAD_IMAGES=false`
/ `SKIP_UPLOAD_SCREENSHOTS=false` and add files under `{locale}/images/`.
