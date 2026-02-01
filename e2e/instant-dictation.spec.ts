import {expect, test} from '@playwright/test';

test.describe('instant dictation', () => {
  test('start a vocabulary dictation, then submit correct answer', async ({ page }) => {
    await page.goto('/instant-dictation');

    const vocabInput0 = page.locator('ion-input[id=vocab0] input');
    await vocabInput0.click();
    await vocabInput0.fill('apple');
    await expect(vocabInput0).toHaveValue('apple');

    await page.locator('#start-by-word-button').click();
    await expect(page).toHaveURL(/\/dictation-practice$/);

    await expect(page.locator('vocab-image img')).toBeVisible();

    // Dictation practice uses a custom virtual keyboard by default.
    // When it is active, the real <ion-input> is removed via *ngIf="!isKeyboardActive",
    // so we need to close it to make a native input available for Playwright.
    const answerInput = page.locator('.answerInput ion-input input');
    const answerDisplay = page.locator('.answerInput .answer-display');
    const keyboardCloseButton = page.locator('virtual-keyboard ion-button', {
      has: page.locator('fa-icon[icon="window-close"]')
    });

    // Wait until either the real input or the virtual-keyboard display is present.
    await expect(answerInput.or(answerDisplay)).toBeVisible();

    if (await answerDisplay.isVisible()) {
      await keyboardCloseButton.click();
      await expect(answerInput).toBeVisible();
    }

    await answerInput.fill('apple');
    await page.locator('.submitBtn').click();

    await expect(page).toHaveURL(/\/practice-complete$/);

    await expect(page.locator('app-practice-complete practice-history-list')).toBeVisible();
    await expect(page.locator('app-practice-complete practice-history-list score')).toContainText(/1\s*\/\s*1/);
  });
});

