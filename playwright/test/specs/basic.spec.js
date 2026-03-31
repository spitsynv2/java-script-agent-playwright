const { expect, test } = require('@playwright/test');
const { currentTest, zebrunner } = require('@zebrunner/javascript-agent-playwright');

test.describe('Playwright website tests', () => {

  test('has title [@small, @fast]', async ({ page }) => {
    zebrunner.testCaseKey('DEF-1');
    currentTest.setMaintainer('admin');

    await page.goto('https://playwright.dev/');

    await expect(page).toHaveTitle(/Playwright/);
  });

  test('get started link [@medium, @fast]', async ({ page }) => {
    zebrunner.testCaseKey('DEF-2');
    currentTest.setMaintainer('admin');

    await page.goto('https://playwright.dev/');

    await page.getByRole('link', { name: 'Get started' }).click();

    await expect(page.getByRole('heading', { name: 'Installation' })).toBeVisible();
  });

  test('check Java tab on getting started [@medium, @fast]', async ({ page }) => {
    zebrunner.testCaseKey('DEF-3');
    currentTest.setMaintainer('admin');

    currentTest.log.info('Navigating to Playwright docs');
    await page.goto('https://playwright.dev/');

    currentTest.log.info('Clicking Get started link');
    await page.getByRole('link', { name: 'Get started' }).click();

    await expect(page.getByRole('heading', { name: 'Installation' })).toBeVisible();

    currentTest.log.info('Checking npm tab is visible');
    const nodeTab = page.getByRole('tab', { name: 'npm', exact: true }).first();
    await expect(nodeTab).toBeVisible();

    currentTest.attachScreenshot(await page.screenshot());
    currentTest.log.info('Getting started page verified');
  });

});
