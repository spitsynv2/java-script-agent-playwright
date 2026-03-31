const { expect, test } = require('@playwright/test');
const { CurrentTest, zebrunner } = require('@zebrunner/javascript-agent-playwright');

const EBAY_URL = 'https://www.ebay.com';

async function acceptCookiesIfPresent(page) {
  const acceptButton = page.locator('#gdpr-banner-accept');
  if (await acceptButton.isVisible({ timeout: 5000 }).catch(() => false)) {
    await acceptButton.click();
  }
}

test.describe('eBay Web Desktop Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(EBAY_URL);
    await acceptCookiesIfPresent(page);
  });

  test('item title on deals page matches item page title (position 0) [@small, @ebay]', async ({ page }) => {
    zebrunner.testCaseKey('DEF-1');
    CurrentTest.setMaintainer('VS');

    const electronicsLink = page.locator('#vl-flyout-nav ul > li').filter({ hasText: 'Electronics' });
    await electronicsLink.click();

    const pageTitle = page.locator('.page-title');
    await expect(pageTitle).toHaveText('Electronics');

    const computersLink = page.locator('a').filter({ hasText: 'Computers, Tablets & Network Hardware' }).first();
    await computersLink.click();

    const dealsTitles = page.locator('.bsig__title');
    const dealItemName = await dealsTitles.nth(0).innerText();

    const dealsButtons = page.locator('.brw-product-card__signals__header');
    await dealsButtons.nth(0).scrollIntoViewIfNeeded();
    await dealsButtons.nth(0).click();

    const itemTitle = page.locator('.x-item-title__mainTitle');
    await expect(itemTitle).toHaveText(dealItemName);
  });

  test('item title on deals page matches item page title (position 1) [@small, @ebay]', async ({ page }) => {
    zebrunner.testCaseKey('DEF-2');
    CurrentTest.setMaintainer('VS');

    const electronicsLink = page.locator('#vl-flyout-nav ul > li').filter({ hasText: 'Electronics' });
    await electronicsLink.click();

    const pageTitle = page.locator('.page-title');
    await expect(pageTitle).toHaveText('Electronics');

    const computersLink = page.locator('a').filter({ hasText: 'Computers, Tablets & Network Hardware' }).first();
    await computersLink.click();

    const dealsTitles = page.locator('.bsig__title');
    const dealItemName = await dealsTitles.nth(1).innerText();

    const dealsButtons = page.locator('.brw-product-card__signals__header');
    await dealsButtons.nth(1).scrollIntoViewIfNeeded();
    await dealsButtons.nth(1).click();

    const itemTitle = page.locator('.x-item-title__mainTitle');
    await expect(itemTitle).toHaveText(dealItemName);
  });

  test('item title on deals page matches item page title (position 2) [@small, @ebay]', async ({ page }) => {
    zebrunner.testCaseKey('DEF-3');
    CurrentTest.setMaintainer('VS');

    const electronicsLink = page.locator('#vl-flyout-nav ul > li').filter({ hasText: 'Electronics' });
    await electronicsLink.click();

    const pageTitle = page.locator('.page-title');
    await expect(pageTitle).toHaveText('Electronics');

    const computersLink = page.locator('a').filter({ hasText: 'Computers, Tablets & Network Hardware' }).first();
    await computersLink.click();

    const dealsTitles = page.locator('.bsig__title');
    const dealItemName = await dealsTitles.nth(2).innerText();

    const dealsButtons = page.locator('.brw-product-card__signals__header');
    await dealsButtons.nth(2).scrollIntoViewIfNeeded();
    await dealsButtons.nth(2).click();

    const itemTitle = page.locator('.x-item-title__mainTitle');
    await expect(itemTitle).toHaveText(dealItemName);
  });
});
