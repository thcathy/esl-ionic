---
name: review-tests
description: >-
  Review and clean Angular/Jasmine unit tests and Playwright e2e tests in esl-ionic.
  Checks that tests are needed and clean, deletes or trims redundant/brittle/obsolete
  specs, updates expectations after API changes, and runs targeted tests. Use when the
  user asks to review tests, clean up specs, remove unneeded tests, prune test coverage,
  or audit *.spec.ts / e2e after a refactor.
---

# Review Tests (esl-ionic)

Review unit/e2e tests related to **current changes** or a **user-specified path**. Prefer fewer high-value tests over many weak ones. Only improve or remove tests — do not expand product scope. If you find a real product bug, **report it**; do not silently change production behavior.

## Project conventions

| Item | Convention |
|------|------------|
| Unit specs | `*.spec.ts` next to source (Jasmine + Angular `TestBed`) |
| Shared helpers | `src/testing/` (`SharedTestModule`, `test-data`) |
| Unit runner | `npm run test-dev` (headless Chrome) |
| Single file | `npx ng test --browsers=ChromeHeadlessCI --watch=false --include='**/foo.spec.ts'` |
| E2E | Playwright via `npm run e2e` / `npm run e2e-ci` |
| Comments | No narrating comments in tests (minimal-comments) |

## Workflow

1. **Scope**
   - Default: specs touched by current git changes + specs for changed production files.
   - If user names a path/glob, use that.
2. **Read** production code and related specs together; note public API and regression risk.
3. **Score each `it` / e2e case** (needed? clean? duplicate?).
4. **Act**
   - Delete or trim unneeded tests.
   - Rewrite brittle or unclear tests that are still valuable.
   - Update expectations when production APIs changed; remove dead expectations.
5. **Run** relevant tests when feasible (`npm run test-dev` or targeted `--include=...`).
6. **Report** what was removed/kept/changed and any product bugs found (without fixing product code unless asked).

## Needed vs unneeded

**Keep** tests that assert real user-visible or contract behavior and catch regressions:
- Pure logic (pipes, helpers, answer checking, URL builders)
- Service contracts (HTTP payload shape, error/empty handling)
- Component behavior that matters (inputs → rendered state / outputs)
- E2E for critical flows only (start practice, login callback) — not every UI tweak

**Delete or trim** when:
- Duplicate coverage of the same behavior (same asserts, different wording)
- Testing private implementation details (`private` methods, internal spy call order with no user impact)
- Asserting framework/library behavior (`TestBed` creates the component, Angular binds `@Input`)
- Obsolete after refactors (dead fields, removed modes, renamed APIs still asserted)
- Snapshot-/DOM-brittle checks that break on harmless template churn
- “Smoke” `expect(component).toBeTruthy()` with no behavior

## Clean tests

- **Names**: describe behavior (`'isWordEqual is case insensitive'`), not implementation (`'calls normalize then compare'`).
- **Focus**: one behavior per `it`; few strong expects over many weak ones.
- **Setup**: use `SharedTestModule` / `test-data` like sibling specs; spy only what the case needs.
- **Avoid**: brittle CSS selectors, exact i18n strings when a key/role is enough, over-mocking.
- **No narrating comments** — names and structure should explain intent.

## Good / bad examples (Angular + Jasmine)

### Duplicate coverage — delete one

```typescript
// ❌ BAD — two its assert the same default-image path
it('default image if no images input', () => {
  component.images = null;
  component.ngOnChanges(null);
  expect(component.imageBase64).toEqual(defaultImage[0]);
});
it('uses default placeholder when images are missing', () => {
  component.images = null;
  component.ngOnChanges(null);
  expect(component.imageBase64).toEqual(defaultImage[0]);
});

// ✅ GOOD — one focused case; fold edge variants into the same it if useful
it('uses default image when images are null or empty', () => {
  component.images = null;
  component.ngOnChanges(null);
  expect(component.imageBase64).toEqual(defaultImage[0]);

  component.images = [];
  component.ngOnChanges(null);
  expect(component.imageBase64).toEqual(defaultImage[0]);
});
```

### Behavior over implementation spies

```typescript
// ❌ BAD — private call-order / framework wiring
it('ngOnInit calls loadImages', () => {
  spyOn(component as any, 'loadImages');
  component.ngOnInit();
  expect((component as any).loadImages).toHaveBeenCalled();
});

// ✅ GOOD — observable outcome
it('loads image paths when word is set', () => {
  httpClientSpy.get.and.returnValue(of({ images: ['img1'], isVerify: true }));
  component.word = 'apple';
  component.ngOnChanges(null);
  expect(component.imageBase64).toContain('img1'); // or whatever public field/DOM matters
});
```

### Contract / pure logic — high value

```typescript
// ✅ GOOD — real regression risk for answer checking
it('isWordEqual ignore space or hyphen', () => {
  ['busstop', 'bus-stop', 'bus stop', ' bus stop '].forEach(input => {
    expect(service.isWordEqual('busstop', input)).toBe(true);
  });
});

// ✅ GOOD — HTTP payload contract
it('save history should trim the input before sending out', () => {
  service.saveHistory([{ question: vocab_apple } as VocabPracticeHistory]);
  const body = httpClientSpy.post.calls.mostRecent().args[1];
  expect(body.histories[0].question.picsFullPaths.length).toBeLessThan(1);
});
```

### Weak / framework-only — remove

```typescript
// ❌ BAD
it('should create', () => {
  expect(component).toBeTruthy();
});

// ❌ BAD — asserts Angular change detection, not product logic
it('updates when input changes', () => {
  component.title = 'Hi';
  fixture.detectChanges();
  expect(fixture.nativeElement.querySelector('h1').textContent).toContain('Hi');
});
// Keep only if this template binding is a known regression hotspot; otherwise drop.
```

### Brittle DOM vs stable outcome

```typescript
// ❌ BAD
expect(fixture.nativeElement.querySelector('.sc-ion-card-md-h > div > span').textContent)
  .toBe('Apple');

// ✅ GOOD — public state, role, or stable test id
expect(component.displayWord).toBe('Apple');
// or: expect(fixture.nativeElement.querySelector('[data-testid="vocab-word"]')).toHaveText('Apple');
```

## After cleanup

Run the smallest useful suite:

```bash
npx ng test --browsers=ChromeHeadlessCI --watch=false --include='**/vocab-image.component.spec.ts'
# or broader:
npm run test-dev
```

For e2e-only cleanups: `npm run e2e-ci` only if Playwright specs changed and runtime is acceptable.

## Output format

```markdown
## Test review summary
- Scope: …
- Removed: … (why)
- Trimmed/rewritten: …
- Kept high-value: …
- Tests run: … (pass/fail)
- Product bugs found (if any): … (not fixed unless asked)
```

## Do not

- Commit unless the user asked
- Change production code to make weak tests pass (fix product only when asked)
- Add narrating comments or expand feature scope while “cleaning tests”
- Keep duplicate its “for safety” — prefer one strong test
