/**
 * A filtered /search-dictation URL fills the form and runs the search.
 * Changing a filter rewrites the query with replaceUrl.
 * Run: PLAYWRIGHT_BASE_URL=http://localhost:4200 npx playwright test e2e/search-dictation-query.spec.ts
 */
import {expect, test} from '@playwright/test';

test.describe('search dictation query params', () => {
  test('a filtered URL restores the form and results', async ({ page }) => {
    await page.goto('/search-dictation?q=apple&suitable=JuniorPrimary&type=Vocab');

    const keyword = page.locator('ion-input[formcontrolname="keyword"] input');
    await expect(keyword).toHaveValue('apple');
    await expect(page.locator('[data-filter="suitable"]')).toContainText('Junior Primary (6-8)');
    await expect(page.locator('[data-filter="type"]')).toContainText('Word');
    await expect(page).toHaveURL(/q=apple/);
    await expect(page).toHaveURL(/suitable=JuniorPrimary/);
    await expect(page).toHaveURL(/type=Vocab/);

    const firstResult = page.locator('#dictation-list ion-item').first();
    await expect(firstResult).toBeVisible({ timeout: 20_000 });

    await page.screenshot({
      path: 'test-results/search-query-deep-link.png',
      fullPage: true,
    });

    const historyLength = await page.evaluate(() => history.length);
    await page.locator('#type-filter').click();
    await page.locator('ion-item', { hasText: 'Sentence' }).click();
    await expect(page).toHaveURL(/type=Article/);
    await expect(page).toHaveURL(/q=apple/);
    expect(await page.evaluate(() => history.length)).toBe(historyLength);

    await page.locator('ion-button', { hasText: 'Search' }).click();
    await expect(page.locator('#dictation-list ion-item').first()).toBeVisible({ timeout: 20_000 });
    await expect(page).toHaveURL(/type=Article/);
    expect(await page.evaluate(() => history.length)).toBe(historyLength);
  });
});
