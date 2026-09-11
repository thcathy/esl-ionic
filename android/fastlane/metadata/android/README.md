# Play Store listing files

Changelogs are generated from repo-root `release_notes/{en,zh-Hant,zh-Hans}.txt`
into these locales before upload:

| Play locale | Source |
| --- | --- |
| en-US, en-GB | `release_notes/en.txt` |
| zh-TW, zh-HK | `release_notes/zh-Hant.txt` |
| zh-CN | `release_notes/zh-Hans.txt` |

Store listing text (title, short description, full description) lives in this
tree and is the Play listing source of truth. Add files under `{locale}/`:

- `title.txt`
- `short_description.txt`
- `full_description.txt`

Binary lanes (`beta`, `release` with `PLAY_UPLOAD_AAB=true`, legacy `upload`)
and `./build.sh metadata_android` **upload listing metadata by default**.
Set `SKIP_UPLOAD_METADATA=true` for a binary-only upload. Changelogs still
upload unless `SKIP_UPLOAD_CHANGELOGS=true`.
Images and screenshots stay skipped unless you set `SKIP_UPLOAD_IMAGES=false`
/ `SKIP_UPLOAD_SCREENSHOTS=false` and add files under `{locale}/images/`.

## Listing refresh (10–11 Sep 2026)

Committed layout for FunFunSpell Play SoT (not uploaded yet):

- Locales: `en-US`, `en-GB`, `zh-TW`, `zh-HK`, `zh-CN`
- Files: `title.txt`, `short_description.txt`, `full_description.txt`
- Phone screenshots: `{locale}/images/phoneScreenshots/` (01–05 from Desktop polished-android)
- **No featureGraphic** in the polished set — left untouched (use existing Play graphic)

Upload when ready:
```bash
SKIP_UPLOAD_SCREENSHOTS=false SKIP_UPLOAD_IMAGES=false ./build.sh metadata_android
```
(Engineer may flip SKIP_UPLOAD_METADATA default to false on #87.)
