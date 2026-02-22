/**
 * Verify edit-dictation page spacing at phone viewport (390px).
 * Run: PLAYWRIGHT_BASE_URL=http://localhost:8100 npx playwright test e2e/edit-dictation-spacing.spec.ts
 */
import { expect, test } from '@playwright/test';

test.describe('edit-dictation spacing at 390px', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('navigate and report spacing measurements', async ({ page }) => {
    await page.goto('/edit-dictation/Start');
    await page.waitForSelector('app-section-card', { timeout: 5000 });

    const observations: string[] = [];

    // Measure card gaps
    const cards = page.locator('.compact-section-card');
    const count = await cards.count();
    observations.push(`Found ${count} section cards`);

    for (let i = 0; i < count - 1; i++) {
      const a = await cards.nth(i).boundingBox();
      const b = await cards.nth(i + 1).boundingBox();
      if (a && b) {
        const gap = Math.round(b.y - (a.y + a.height));
        observations.push(`Gap between card ${i + 1} and ${i + 2}: ${gap}px`);
      }
    }

    // ion-item styles
    const firstItem = page.locator('.compact-section-card ion-item').first();
    const itemStyles = await firstItem.evaluate((el) => {
      const cs = getComputedStyle(el);
      return {
        minHeight: cs.minHeight,
        paddingStart: cs.paddingLeft,
        paddingEnd: cs.paddingRight,
      };
    });
    observations.push(
      `ion-item: min-height=${itemStyles.minHeight} padding-start=${itemStyles.paddingStart} padding-end=${itemStyles.paddingEnd}`
    );

    // Action button margins
    const actionBtn = page.locator('.action-button').first();
    const btnMargin = await actionBtn.evaluate(
      (el) => getComputedStyle(el).margin
    );
    observations.push(`Action button margin: ${btnMargin}`);

    // Options notes
    const optionsNotes = page.locator('.options-notes');
    if (await optionsNotes.isVisible()) {
      const notesStyle = await optionsNotes.evaluate((el) => ({
        margin: getComputedStyle(el).margin,
        padding: getComputedStyle(el).padding,
      }));
      observations.push(
        `Options notes: margin=${notesStyle.margin} padding=${notesStyle.padding}`
      );
    }

    // Card header
    const header = page.locator('.compact-section-card ion-card-header').first();
    const headerPadding = await header.evaluate(
      (el) => getComputedStyle(el).padding
    );
    observations.push(`Card header padding: ${headerPadding}`);

    // Card content
    const content = page.locator('.compact-section-card ion-card-content').first();
    const contentPadding = await content.evaluate(
      (el) => getComputedStyle(el).padding
    );
    observations.push(`Card content padding: ${contentPadding}`);

    // Output for reporter
    console.log('\n=== Spacing at 390px viewport ===');
    observations.forEach((o) => console.log(o));

    await page.screenshot({
      path: 'e2e/edit-dictation-390px.png',
      fullPage: true,
    });

    expect(count).toBeGreaterThanOrEqual(2);
  });
});
