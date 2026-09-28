/**
 * Search result "View" opens /dictation-view/:id and loads that dictation.
 * Needs a build that navigates search hits by id (this branch). Against current
 * UAT the list still opens /dictation-view without an id.
 * Run: PLAYWRIGHT_BASE_URL=http://localhost:4200 npx playwright test e2e/search-dictation-open-by-id.spec.ts
 */
import {expect, test} from '@playwright/test';

test.describe('search dictation opens by id', () => {
  test('view the first search result on /dictation-view/:id', async ({ page }) => {
    await page.goto('/search-dictation');

    const keyword = page.locator('ion-searchbar input');
    await keyword.click();
    await keyword.fill('apple');

    await page.locator('ion-button', { hasText: 'Search' }).click();

    const firstResult = page.locator('#dictation-list ion-item').first();
    await expect(firstResult).toBeVisible({ timeout: 20_000 });

    const title = (await firstResult.locator('.heading').innerText()).trim();
    expect(title.length).toBeGreaterThan(0);

    await page.locator('ion-card.dictation-list').screenshot({
      path: 'test-results/demo-search-results.png',
    });

    await firstResult.locator('ion-button', { hasText: 'View' }).click();

    await expect(page).toHaveURL(/\/dictation-view\/\d+$/);
    const dictationId = page.url().match(/\/dictation-view\/(\d+)$/)?.[1];
    expect(dictationId).toMatch(/^\d+$/);

    const card = page.locator('app-dictation-card');
    await expect(card).toBeVisible();
    await expect(card).toContainText(title);
    await expect(card.locator('strong').filter({ hasText: dictationId })).toBeVisible();

    await page.screenshot({
      path: 'test-results/demo-dictation-view-by-id.png',
    });

    const backButton = page.locator('ion-header ion-button', {
      has: page.locator('fa-icon[icon="angle-left"]'),
    });
    await expect(backButton).toBeVisible();

    await page.screenshot({
      path: 'test-results/search-dictation-open-by-id.png',
      fullPage: true,
    });

    await backButton.click();
    await expect(page).toHaveURL(/\/search-dictation$/);
    await expect(page.locator('#dictation-list ion-item').first()).toBeVisible();
  });
});
