const { test, expect } = require('../ios-fixtures');

test.describe.configure({ mode: 'serial' });

test.describe('iOS Safari — Real device tests', () => {

  test('has title', async ({ page }) => {
    await page.goto('https://playwright.dev/');
    await expect(page).toHaveTitle(/Playwright/);
  });

  test('get started link', async ({ page }) => {
    await page.goto('https://playwright.dev/');
    await page.getByRole('link', { name: 'Get started' }).click();
    await expect(page.getByRole('heading', { name: 'Installation' })).toBeVisible();
  });

  test('screenshot', async ({ page }) => {
    await page.goto('https://playwright.dev/');
    const buf = await page.screenshot();
    console.log('Screenshot size:', buf.length, 'bytes');
  });

});
