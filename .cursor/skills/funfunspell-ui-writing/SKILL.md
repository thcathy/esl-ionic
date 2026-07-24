---
name: funfunspell-ui-writing
description: >-
  Writes learner-facing FunFunSpell UI text in English, Simplified Chinese
  (zh-Hans), and Traditional Chinese (zh-Hant). Use when drafting or revising
  button labels, titles, empty/error/success messages, onboarding, i18n strings,
  or any user-visible text for esl-ionic. Owns what the user sees — never invent
  technical or internal wording for the UI.
---

# FunFunSpell UI Writing

Write **only** what learners and parents see. Match FunFunSpell: an English vocabulary and self-dictation practice app.

This skill is used by **`esl-ui-writer`** (and by `esl-uiux` / programmers when that agent has not run).

Canonical version of this skill also lives in `esl-all/.cursor/skills/funfunspell-ui-writing/` (workspace). Keep them in sync when editing.

## When to use

- New or changed UI strings, CTAs, titles, helper text, empty/error/success states
- Filling `en` / `zh-Hans` / `zh-Hant` i18n values under `src/assets/i18n/`
- Softening or rewriting draft labels from UX/design briefs

## Product voice

| Do | Don't |
|----|--------|
| Warm, clear, encouraging | Clever jargon, slogans that obscure the action |
| Short labels; one idea per line | Long explanations on buttons |
| Practice / listen / spell / review language | Engineering or design-process language |
| Speak to learners and parents | Speak to developers |

**FunFunSpell is:** English vocabulary + self-dictation (listen and type / spell). Features like voice, images, and meanings are **learner benefits**, not system architecture.

## Hard bans (never in UI text)

- Technical terms: API, endpoint, payload, cache, token, Auth0, Capacitor, TTS pipeline, preload, JSON, i18n key, component, service, queue, sync conflict, null, timeout (as jargon)
- Internal design ideas: “use shared module”, “follow Ionic lifecycle”, “wire ngx-translate”, “MVP”, “tech debt”, “refactor”, screen/component codenames
- Raw key names or file paths as visible text
- Untranslated English left in Chinese locales (except proper nouns like **FunFunSpell**, and English vocabulary being practiced)

If a brief mentions those, translate the **user outcome** only (e.g. “Preparing dictation…” not “Preloading TTS assets”).

## Locales (always deliver all three when writing product UI)

| Locale | File | Notes |
|--------|------|--------|
| English | `src/assets/i18n/en.json` | Natural, concise; US/intl school-friendly |
| Simplified Chinese | `src/assets/i18n/zh-Hans.json` | Prefer **听写练习** for dictation exercises |
| Traditional Chinese | `src/assets/i18n/zh-Hant.json` | Prefer **默書** / **聽寫默書練習** where existing strings do |

Match existing app terms when nearby strings already set a convention:

| Concept | en | zh-Hans | zh-Hant |
|---------|----|---------|---------|
| Vocabulary items | words / vocabs (context) | 生字 | 生字 |
| Dictation exercise | dictation / exercise | 听写练习 | 默書 / 聽寫練習 |
| Practice action | Start / Practice | 开始练习 | 開始練習 |
| Create | Create | 建立 | 建立 |
| Find | Find | 寻找 | 尋找 |

Prefer **native** wording per locale — do not literal-translate English word-for-word when a natural Chinese phrase exists.

## Length & hierarchy

1. **Button / tab:** ≤ ~12 characters EN; short Chinese (often 2–4 chars)
2. **Title:** one short phrase
3. **Supporting line:** one sentence max
4. **Error:** what happened + what to try next, no blame, no stack traces

## Workflow

1. Read the screen goal and states (loading / empty / error / success / guest vs logged-in).
2. Skim neighboring strings in `src/assets/i18n/` for tone and term reuse.
3. Draft **en**, then **zh-Hans**, then **zh-Hant** — not one language then machine-mirror.
4. Self-check against **Hard bans** and product voice.
5. Output using the template below.

## Output template

```markdown
## UI text set: <screen or flow name>

| Key (suggested) | en | zh-Hans | zh-Hant | Notes |
|-----------------|----|---------|---------|-------|
| … | … | … | … | optional |

### Rationale (1–3 bullets, for agents only — not for the UI)
- why these words fit FunFunSpell
```

Put learner-facing strings only in the table cells. Keep rationale out of the app.

## Examples

**Good**

| en | zh-Hans | zh-Hant |
|----|---------|---------|
| Ready to practice! | 可以开始练习了！ | 可以開始練習了！ |
| Some audio couldn't be loaded | 部分语音未能载入 | 部分語音未能載入 |
| Continue with local voice | 改用本机语音继续 | 改用本機語音繼續 |

**Bad (never ship)**

- “TTS preload failed — fallback to Web Speech API”
- “Bind ngx-translate key Preload.Status”
- “Auth0 silent auth required before cloud sync”
