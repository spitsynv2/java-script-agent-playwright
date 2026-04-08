const { test, expect } = require('../ios-fixtures');

test.describe.configure({ mode: 'serial' });

test.describe('iOS Safari — Real device tests', () => {

  test('navigate and check title', async ({ page }) => {
    await page.goto('https://playwright.dev/', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveTitle(/Playwright/);
    await page.goto('https://playwright.dev/docs/api/class-android', { waitUntil: 'domcontentloaded' });
    await page.goto('https://playwright.dev/docs/api/class-consolemessage', { waitUntil: 'domcontentloaded' });
    await page.goto('https://playwright.dev/docs/api/class-browserserver', { waitUntil: 'domcontentloaded' });
    await page.goto('https://playwright.dev/docs/api/class-cdpsession', { waitUntil: 'domcontentloaded' });
  });

});
