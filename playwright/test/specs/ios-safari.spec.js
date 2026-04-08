const { test, expect } = require('../ios-fixtures');

test.describe.configure({ mode: 'serial' });

test.describe('iOS Safari — Real device tests', () => {

  test('navigate and check title', async ({ page }) => {
    await page.goto('https://playwright.dev/', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveTitle(/Playwright/);
  });

  test('click a link and verify navigation', async ({ page }) => {
    await page.goto('https://playwright.dev/', { waitUntil: 'domcontentloaded' });
    await page.getByRole('link', { name: 'Get started' }).click();
    await expect(page.getByRole('heading', { name: 'Installation' })).toBeVisible();
  });

  test('evaluate JavaScript in Safari', async ({ page }) => {
    await page.goto('https://saucelabs.com/test/guinea-pig', { waitUntil: 'domcontentloaded' });
    const userAgent = await page.evaluate(() => navigator.userAgent);
    console.log('Safari User-Agent:', userAgent);
    expect(userAgent).toContain('Safari');
  });

  test('screenshot', async ({ page }) => {
    await page.goto('https://playwright.dev/', { waitUntil: 'domcontentloaded' });
    const buf = await page.screenshot();
    console.log('Screenshot size:', buf.length, 'bytes');
    expect(buf.length).toBeGreaterThan(0);
  });

});
