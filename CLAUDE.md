# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

FunFunSpell (esl-ionic) is an English dictation practice app built with **Angular 21 + Ionic 8 + Capacitor 8**. It runs as:
- A Progressive Web App (PWA) at funfunspell.com
- A native iOS app (via Capacitor)
- A native Android app (via Capacitor)

Backend API: `https://esl-rest.funfunspell.com/esl-rest` (configurable via `environment.apiHost`). Dev environment points to production API by default; can be changed to `http://localhost:8080`.

## Commands

```bash
# Development
npm start              # Serve locally (ng serve)
npm run build          # Build for development
npm run lint           # Run ESLint

# Testing
npm test               # Run unit tests (Chrome with autoplay)
npm run test-dev       # Run unit tests headless (CI-friendly, use this in terminal)
npm run test-ci        # Run unit tests headless, no watch mode

# E2E tests (Playwright)
npm run e2e            # Run e2e tests (installs Chromium first)
npm run e2e-ci         # Run e2e with line reporter

# Mobile / Release builds (via build.sh)
./build.sh build_firebase        # Production web build
./build.sh release_web_uat       # Deploy to UAT Firebase (batch4-161201)
./build.sh release_web_prod      # Deploy to prod Firebase (funfunspell-firebase)
./build.sh test_ios              # Build iOS for testing
./build.sh release_ios           # Archive and upload to App Store
./build.sh buildAndroidApk       # Build signed APK (requires ESL_IONIC_KEYSTORE_PASSWORD)
./build.sh release_android       # Bundle and publish to Play Store
```

## Architecture

### App Structure

```
src/app/
├── pages/          # Full-page routed views
├── components/     # Reusable UI components
├── services/       # Business logic and API calls
├── entity/         # Data model classes/interfaces
├── enum/           # TypeScript enums
├── guards/         # Route guards
├── interceptor/    # HTTP interceptors
├── pipes/          # Angular pipes
└── utils/          # Utility functions
```

### Routing & Navigation

All routes are lazy-loaded modules defined in `app-routing.module.ts`. Navigation between pages is handled via `NavigationService` rather than direct router calls — it wraps the Angular Router and stores inter-page data in `StorageService` (Ionic Storage, backed by IndexedDB). Key storage slots are in `NavigationService.storageKeys`.

### Dictation Flow

Two practice modes, both initiated via `NavigationService.startDictation()`:
1. **Vocabulary dictation** → `/dictation-practice` — word-by-word spelling (or puzzle mode)
2. **Article/sentence dictation** → `/article-dictation` — sentence-level fill-in-the-blank

A dictation can be from the server (has a real `id`), an instant/on-the-fly dictation (`id < 0`), or a generated dictation (AI-assisted, identified via `DictationHelper.isGeneratedDictation()`).

### TTS / Speech

`SpeechService` is the single entry point for all text-to-speech:
- **Native app** (Capacitor): uses `@capacitor-community/text-to-speech`
- **Browser**: uses Web Speech API (`window.speechSynthesis`); on iOS Safari, `speak()` must be called synchronously in a user gesture — call `ensureVoiceLoaded()` earlier to preload the voice cache

Voice mode (online vs local) is stored in `UIOptionsService` / `StorageService`. Online mode fetches pre-generated MP3s from `https://audio.funfunspell.com` via `TtsCloudService`. Cloud audio keys follow the pattern `tts/{version}/{shard}/{slug}/{sha256hash}.mp3`.

`AppService.isApp()` returns `true` when running inside a Capacitor WebView (not PWA). Use this to branch native vs web behavior.

### Authentication

Auth0 (`thcathy.auth0.com`) for login. `FFSAuthService` wraps `@auth0/auth0-angular`:
- Web: redirect-based login
- Capacitor: uses `@capacitor/browser` for in-app browser + custom URL scheme callback

The `IdTokenInterceptor` attaches the JWT from `localStorage('id_token')` as `Authorization: Bearer` to all API requests (except Firebase image requests).

### i18n

Three locales supported: `en`, `zh-Hans`, `zh-Hant`. Translation files in `src/assets/i18n/`. Uses `@ngx-translate/core` with HTTP loader.

### Environment Config

- `src/environments/base-env.ts` — shared constants (TTS URLs, API hosts, feature flags)
- `src/environments/environment.ts` — dev (production: false)
- `src/environments/environment.prod.ts` — production build

### Key Services

| Service | Responsibility |
|---|---|
| `DictationService` | API calls for dictation CRUD, search, history |
| `DictationHelper` | Dictation type detection, word extraction |
| `ArticleDictationService` | Sentence dictation logic, punctuation handling |
| `VocabPracticeService` | Question generation, answer checking, puzzle mode |
| `SpeechService` | TTS orchestration (cloud vs native vs web) |
| `TtsCloudService` | Cloud audio URL construction and playback |
| `FFSAuthService` | Auth0 login/logout, token management |
| `NavigationService` | Page navigation and inter-page data passing |
| `UIOptionsService` | User preference persistence (keyboard type, voice mode, etc.) |
| `StorageService` | Ionic Storage wrapper (IndexedDB) |
| `MemberService` | Member profile API |

## Git Conventions

- Never include Claude attribution (no `Co-Authored-By: Claude`, no "Generated with Claude Code") in commit messages.

### Component Patterns

Pages use `ionViewWillEnter()` (not `ngOnInit()`) for data initialization, since Ionic caches page instances and `ngOnInit` only fires once. Components are declared in `shared.module.ts` and `components.module.ts` which are imported by page modules.