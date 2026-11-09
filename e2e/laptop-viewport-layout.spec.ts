/**
 * Practice-start and Create/Start stay usable on short laptop viewports.
 * Run: PLAYWRIGHT_BASE_URL=http://127.0.0.1:4200 npx playwright test e2e/laptop-viewport-layout.spec.ts
 */
import {expect, test, type Page} from '@playwright/test';

async function boxInViewport(page: Page, selector: string) {
  const box = await page.locator(selector).first().boundingBox();
  const viewport = page.viewportSize();
  expect(box, `${selector} has a box`).toBeTruthy();
  expect(viewport).toBeTruthy();
  return {box: box!, viewport: viewport!};
}

test.describe('laptop viewport layout', () => {
  test('practice START is in the first screen at 1280x800', async ({page}) => {
    await page.setViewportSize({width: 1280, height: 800});
    await page.goto('/dictation-view/1649');
    const start = page.locator('app-dictation-card .start-button');
    await expect(start).toBeVisible({timeout: 20_000});
    const {box, viewport} = await boxInViewport(page, 'app-dictation-card .start-button');
    expect(box.y).toBeGreaterThanOrEqual(0);
    expect(box.y + box.height).toBeLessThanOrEqual(viewport.height);
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(scrollWidth).toBeLessThanOrEqual(viewport.width + 1);
  });

  test('practice options reflow at a short zoomed viewport', async ({page}) => {
    await page.setViewportSize({width: 848, height: 473});
    await page.goto('/dictation-view/1649');
    const start = page.locator('app-dictation-card .start-button');
    await expect(start).toBeVisible({timeout: 20_000});
    const {box, viewport} = await boxInViewport(page, 'app-dictation-card .start-button');
    expect(box.y + box.height).toBeLessThanOrEqual(viewport.height);

    const tiles = page.locator('app-vocab-practice-type-selector .puzzle span');
    await expect(tiles).toHaveCount(4);
    for (let i = 0; i < 4; i++) {
      const tile = await tiles.nth(i).boundingBox();
      expect(tile).toBeTruthy();
      expect(tile!.x).toBeGreaterThanOrEqual(0);
      expect(tile!.x + tile!.width).toBeLessThanOrEqual(viewport.width + 1);
    }

    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(scrollWidth).toBeLessThanOrEqual(viewport.width + 1);
  });

  test('quick-start Preview stays in view on a short viewport', async ({page}) => {
    await page.setViewportSize({width: 848, height: 473});
    await page.goto('/edit-dictation/Start');
    const preview = page.locator('ion-footer.form-actions ion-button', {hasText: 'Preview'});
    await expect(preview).toBeVisible({timeout: 20_000});
    const {box, viewport} = await boxInViewport(page, 'ion-footer.form-actions ion-button');
    expect(box.y + box.height).toBeLessThanOrEqual(viewport.height + 1);

    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(scrollWidth).toBeLessThanOrEqual(viewport.width + 1);
  });

  test('quick-start Preview stays in view at 1280x800', async ({page}) => {
    await page.setViewportSize({width: 1280, height: 800});
    await page.goto('/edit-dictation/Start');
    const preview = page.locator('ion-footer.form-actions ion-button', {hasText: 'Preview'});
    await expect(preview).toBeVisible({timeout: 20_000});
    const {box, viewport} = await boxInViewport(page, 'ion-footer.form-actions ion-button');
    expect(box.y + box.height).toBeLessThanOrEqual(viewport.height + 1);
  });

  test('phone portrait does not overflow horizontally', async ({page}) => {
    await page.setViewportSize({width: 390, height: 844});
    await page.goto('/dictation-view/1649');
    await expect(page.locator('app-dictation-card .start-button')).toBeVisible({timeout: 20_000});
    const practiceWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(practiceWidth).toBeLessThanOrEqual(391);

    await page.goto('/edit-dictation/Start');
    await expect(page.locator('ion-footer.form-actions ion-button', {hasText: 'Preview'})).toBeVisible();
    const editWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(editWidth).toBeLessThanOrEqual(391);
  });
});
