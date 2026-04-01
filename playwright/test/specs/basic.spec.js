const { expect, test } = require('@playwright/test');
const { currentTest, currentLaunch, zebrunner } = require('@zebrunner/javascript-agent-playwright');

const docPages = [
  { label: 'Homepage', url: 'https://playwright.dev/', titlePattern: /Playwright/ },
  { label: 'Installation', url: 'https://playwright.dev/docs/intro', heading: 'Installation' },
  { label: 'Writing Tests', url: 'https://playwright.dev/docs/writing-tests', heading: 'Writing tests' },
  { label: 'Generating Tests', url: 'https://playwright.dev/docs/codegen-intro', urlPattern: /codegen/ },
  { label: 'Running Tests', url: 'https://playwright.dev/docs/running-tests', urlPattern: /running-tests/ },
  { label: 'Trace Viewer', url: 'https://playwright.dev/docs/trace-viewer-intro', urlPattern: /trace-viewer/ },
  { label: 'Test Configuration', url: 'https://playwright.dev/docs/test-configuration', urlPattern: /test-configuration/ },
  { label: 'CI Configuration', url: 'https://playwright.dev/docs/ci', urlPattern: /\/ci/ },
  { label: 'Browsers', url: 'https://playwright.dev/docs/browsers', urlPattern: /browsers/ },
  { label: 'Assertions', url: 'https://playwright.dev/docs/test-assertions', urlPattern: /test-assertions/ },
  { label: 'Locators', url: 'https://playwright.dev/docs/locators', urlPattern: /locators/ },
  { label: 'Actions', url: 'https://playwright.dev/docs/input', urlPattern: /input/ },
  { label: 'Auto-waiting', url: 'https://playwright.dev/docs/actionability', urlPattern: /actionability/ },
  { label: 'Annotations', url: 'https://playwright.dev/docs/test-annotations', urlPattern: /test-annotations/ },
  { label: 'Test Fixtures', url: 'https://playwright.dev/docs/test-fixtures', urlPattern: /test-fixtures/ },
  { label: 'Page Object Models', url: 'https://playwright.dev/docs/pom', urlPattern: /pom/ },
  { label: 'Authentication', url: 'https://playwright.dev/docs/auth', urlPattern: /auth/ },
  { label: 'Parallelism', url: 'https://playwright.dev/docs/test-parallel', urlPattern: /test-parallel/ },
];

const parsedTestCount = Number.parseInt(process.env.PW_TEST_COUNT || '', 10);
const generatedTestCount = Number.isFinite(parsedTestCount) && parsedTestCount > 0 ? parsedTestCount : 25;

async function docsWalkthrough(page, testNumber) {
  for (let i = 0; i < docPages.length; i++) {
    const doc = docPages[i];
    currentTest.log.info(`Step ${i + 1}/${docPages.length}: Opening ${doc.label}`);
    await page.goto(doc.url);

    if (doc.titlePattern) {
      await expect(page).toHaveTitle(doc.titlePattern);
    }
    if (doc.heading) {
      await expect(page.getByRole('heading', { name: doc.heading, level: 1 })).toBeVisible();
    }
    if (doc.urlPattern) {
      await expect(page).toHaveURL(doc.urlPattern);
    }
    currentTest.attachScreenshot(await page.screenshot());

    await page.evaluate(() => window.scrollBy(0, 600));
    await page.waitForTimeout(400);
    currentTest.attachScreenshot(await page.screenshot());

    if (i % 2 === 0) {
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(400);
      currentTest.log.info(`Scrolled to bottom of ${doc.label}`);
      currentTest.attachScreenshot(await page.screenshot());
    }
  }

  currentTest.log.info('Returning to Installation page for tab interactions');
  await page.goto('https://playwright.dev/docs/intro');
  await expect(page.getByRole('heading', { name: 'Installation' })).toBeVisible();

  const tabs = ['npm', 'yarn', 'pnpm'];
  for (const tabName of tabs) {
    const tab = page.getByRole('tab', { name: tabName, exact: true }).first();
    await expect(tab).toBeVisible();
    await tab.click();
    await page.waitForTimeout(300);
    currentTest.log.info(`Clicked ${tabName} tab`);
    currentTest.attachScreenshot(await page.screenshot());
  }

  currentTest.log.info(`Test ${testNumber}: walkthrough finished — ${docPages.length} docs pages visited`);
}

test.describe('Playwright website tests', () => {

  for (let n = 1; n <= generatedTestCount; n++) {
    test(`docs guide walkthrough ${n} [@large, @slow]`, async ({ page }) => {
      test.setTimeout(120_000);
      zebrunner.testCaseKey(`DEF-${n}`);
      currentTest.setMaintainer('admin');
      currentTest.attachLabel('scope', 'navigation', 'docs', 'e2e');

      await docsWalkthrough(page, n);
    });
  }

});
