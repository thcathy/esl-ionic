import {expect, test} from '@playwright/test';

test.describe('app shell', () => {
  test('should have menu', async ({ page }) => {
    await page.goto('/');

    const menuButton = page.locator('ion-menu-button');
    await expect(menuButton).toBeVisible();

    // Ionic menu can be present but off-canvas; keep the assertion lightweight.
    await menuButton.click();
    await expect(page.locator('ion-menu')).toBeVisible();
  });

  test('click home page Quick Start launches edit-dictation Start page', async ({ page }) => {
    await page.goto('/');

    // Home uses translated labels; in default EN this is "Quick Start".
    // Disambiguate between the menu item and the main content card.
    await page.locator('#main ion-item', { hasText: /Quick Start/i }).first().click();
    await expect(page).toHaveURL(/\/edit-dictation\/Start$/);
  });
});

