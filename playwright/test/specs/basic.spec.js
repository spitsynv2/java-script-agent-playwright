const { expect, test } = require('@playwright/test');
const { currentTest, currentLaunch, zebrunner } = require('@zebrunner/javascript-agent-playwright');

test.describe('Playwright website tests', () => {

  test('complete docs guide walkthrough [@large, @slow]', async ({ page }) => {
    test.setTimeout(120_000);
    zebrunner.testCaseKey('DEF-1');
    currentTest.setMaintainer('admin');
    currentTest.attachLabel('scope', 'navigation', 'docs', 'e2e');

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

    currentTest.log.info(`Walkthrough finished — ${docPages.length} docs pages visited`);
  });

  test('API reference deep dive [@large, @slow]', async ({ page }) => {
    test.setTimeout(120_000);
    zebrunner.testCaseKey('DEF-2');
    currentTest.setMaintainer('admin');
    currentTest.attachLabel('scope', 'api', 'e2e');

    const apiClasses = [
      'class-playwright',
      'class-browser',
      'class-browsercontext',
      'class-page',
      'class-frame',
      'class-locator',
      'class-locatorassertions',
      'class-pageassertions',
      'class-request',
      'class-response',
      'class-route',
      'class-apirequestcontext',
      'class-browsertype',
      'class-elementhandle',
      'class-jshandle',
      'class-consolemessage',
      'class-dialog',
      'class-download',
      'class-filechooser',
      'class-keyboard',
      'class-mouse',
      'class-touchscreen',
    ];

    for (let i = 0; i < apiClasses.length; i++) {
      const cls = apiClasses[i];
      const displayName = cls.replace('class-', '');
      currentTest.log.info(`Step ${i + 1}/${apiClasses.length}: Navigating to ${displayName}`);
      await page.goto(`https://playwright.dev/docs/api/${cls}`);
      await expect(page).toHaveURL(new RegExp(cls));
      await expect(page.getByRole('heading', { level: 1 }).first()).toBeVisible();
      currentTest.attachScreenshot(await page.screenshot());

      await page.evaluate(() => window.scrollBy(0, 500));
      await page.waitForTimeout(350);
      currentTest.attachScreenshot(await page.screenshot());

      if (i % 3 === 0) {
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
        await page.waitForTimeout(350);
        currentTest.log.info(`Reached bottom of ${displayName}`);
        currentTest.attachScreenshot(await page.screenshot());

        await page.evaluate(() => window.scrollTo(0, 0));
        await page.waitForTimeout(250);
      }
    }

    currentTest.log.info('Performing search from API docs');
    const searchTerms = ['waitForSelector', 'click', 'fill'];
    for (const term of searchTerms) {
      const searchButton = page.getByRole('button', { name: 'Search' });
      await searchButton.click();

      const searchInput = page.locator('.DocSearch-Input');
      await expect(searchInput).toBeVisible({ timeout: 5000 });

      await searchInput.fill(term);
      await page.waitForTimeout(1500);

      const hitItems = page.locator('.DocSearch-Hit');
      await expect(hitItems.first()).toBeVisible({ timeout: 10_000 });
      const hitCount = await hitItems.count();
      currentTest.log.info(`Search "${term}": found ${hitCount} results`);
      currentTest.attachScreenshot(await page.screenshot());

      await hitItems.first().click();
      await page.waitForLoadState('domcontentloaded');
      currentTest.attachScreenshot(await page.screenshot());
    }

    currentTest.log.info(`API deep dive finished — ${apiClasses.length} classes + ${searchTerms.length} searches`);
  });

  test('cross-language docs exploration [@large, @slow]', async ({ page }) => {
    test.setTimeout(120_000);
    zebrunner.testCaseKey('DEF-3');
    currentTest.setMaintainer('admin');
    currentTest.attachLabel('scope', 'i18n', 'e2e');

    const languages = [
      { name: 'Node.js', prefix: '' },
      { name: 'Python', prefix: '/python' },
      { name: 'Java', prefix: '/java' },
      { name: '.NET', prefix: '/dotnet' },
    ];

    const docPaths = [
      { label: 'Homepage', path: '/' },
      { label: 'Installation', path: '/docs/intro' },
      { label: 'Writing Tests', path: '/docs/writing-tests' },
      { label: 'Locators', path: '/docs/locators' },
      { label: 'Assertions', path: '/docs/test-assertions' },
      { label: 'Actions', path: '/docs/input' },
      { label: 'Test Configuration', path: '/docs/test-configuration' },
      { label: 'Browsers', path: '/docs/browsers' },
    ];

    for (const lang of languages) {
      currentTest.log.info(`=== Exploring ${lang.name} docs (${docPaths.length} pages) ===`);

      for (const doc of docPaths) {
        const url = `https://playwright.dev${lang.prefix}${doc.path}`;
        currentTest.log.info(`${lang.name}: ${doc.label}`);
        await page.goto(url);
        await expect(page).toHaveTitle(/Playwright/);
        currentTest.attachScreenshot(await page.screenshot());

        await page.evaluate(() => window.scrollBy(0, 500));
        await page.waitForTimeout(350);
        currentTest.attachScreenshot(await page.screenshot());
      }

      currentTest.log.info(`${lang.name}: visiting Community page`);
      await page.goto(`https://playwright.dev${lang.prefix}/community/welcome`);
      await expect(page).toHaveTitle(/Playwright/);
      currentTest.attachScreenshot(await page.screenshot());

      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(400);
      currentTest.attachScreenshot(await page.screenshot());
    }

    currentTest.log.info('Final: searching across Node.js docs');
    await page.goto('https://playwright.dev/');

    const searchTerms = ['browser', 'locator', 'assertion'];
    for (const term of searchTerms) {
      const searchButton = page.getByRole('button', { name: 'Search' });
      await searchButton.click();

      const searchInput = page.locator('.DocSearch-Input');
      await expect(searchInput).toBeVisible({ timeout: 5000 });

      await searchInput.fill(term);
      await page.waitForTimeout(1500);

      const hitItems = page.locator('.DocSearch-Hit');
      await expect(hitItems.first()).toBeVisible({ timeout: 10_000 });
      const hitCount = await hitItems.count();
      currentTest.log.info(`Search "${term}": found ${hitCount} results`);
      currentTest.attachScreenshot(await page.screenshot());

      await hitItems.first().click();
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(500);
      currentTest.attachScreenshot(await page.screenshot());
    }

    currentTest.log.info(`Cross-language exploration finished — ${languages.length} languages x ${docPaths.length} pages + 3 searches`);
  });

  test('Python docs full walkthrough [@large, @slow]', async ({ page }) => {
    test.setTimeout(120_000);
    zebrunner.testCaseKey('DEF-4');
    currentTest.setMaintainer('admin');
    currentTest.attachLabel('scope', 'python', 'e2e');

    const pages = [
      '/python/',
      '/python/docs/intro',
      '/python/docs/writing-tests',
      '/python/docs/codegen-intro',
      '/python/docs/running-tests',
      '/python/docs/trace-viewer-intro',
      '/python/docs/test-configuration',
      '/python/docs/ci',
      '/python/docs/browsers',
      '/python/docs/test-assertions',
      '/python/docs/locators',
      '/python/docs/input',
      '/python/docs/actionability',
      '/python/docs/test-annotations',
      '/python/docs/pom',
      '/python/docs/auth',
      '/python/docs/test-parallel',
      '/python/docs/api/class-playwright',
      '/python/docs/api/class-browser',
      '/python/docs/api/class-page',
    ];

    for (let i = 0; i < pages.length; i++) {
      const url = `https://playwright.dev${pages[i]}`;
      currentTest.log.info(`Step ${i + 1}/${pages.length}: ${pages[i]}`);
      await page.goto(url);
      await expect(page).toHaveTitle(/Playwright/);
      currentTest.attachScreenshot(await page.screenshot());

      await page.evaluate(() => window.scrollBy(0, 600));
      await page.waitForTimeout(400);
      currentTest.attachScreenshot(await page.screenshot());

      if (i % 2 === 0) {
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
        await page.waitForTimeout(400);
        currentTest.attachScreenshot(await page.screenshot());
      }
    }

    currentTest.log.info(`Python docs walkthrough finished — ${pages.length} pages visited`);
  });

  test('Java docs full walkthrough [@large, @slow]', async ({ page }) => {
    test.setTimeout(120_000);
    zebrunner.testCaseKey('DEF-5');
    currentTest.setMaintainer('admin');
    currentTest.attachLabel('scope', 'java', 'e2e');

    const pages = [
      '/java/',
      '/java/docs/intro',
      '/java/docs/writing-tests',
      '/java/docs/codegen-intro',
      '/java/docs/running-tests',
      '/java/docs/trace-viewer-intro',
      '/java/docs/test-configuration',
      '/java/docs/ci',
      '/java/docs/browsers',
      '/java/docs/test-assertions',
      '/java/docs/locators',
      '/java/docs/input',
      '/java/docs/actionability',
      '/java/docs/test-annotations',
      '/java/docs/pom',
      '/java/docs/auth',
      '/java/docs/test-parallel',
      '/java/docs/api/class-playwright',
      '/java/docs/api/class-browser',
      '/java/docs/api/class-page',
    ];

    for (let i = 0; i < pages.length; i++) {
      const url = `https://playwright.dev${pages[i]}`;
      currentTest.log.info(`Step ${i + 1}/${pages.length}: ${pages[i]}`);
      await page.goto(url);
      await expect(page).toHaveTitle(/Playwright/);
      currentTest.attachScreenshot(await page.screenshot());

      await page.evaluate(() => window.scrollBy(0, 600));
      await page.waitForTimeout(400);
      currentTest.attachScreenshot(await page.screenshot());

      if (i % 2 === 0) {
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
        await page.waitForTimeout(400);
        currentTest.attachScreenshot(await page.screenshot());
      }
    }

    currentTest.log.info(`Java docs walkthrough finished — ${pages.length} pages visited`);
  });

  test('.NET docs full walkthrough [@large, @slow]', async ({ page }) => {
    test.setTimeout(120_000);
    zebrunner.testCaseKey('DEF-6');
    currentTest.setMaintainer('admin');
    currentTest.attachLabel('scope', 'dotnet', 'e2e');

    const pages = [
      '/dotnet/',
      '/dotnet/docs/intro',
      '/dotnet/docs/writing-tests',
      '/dotnet/docs/codegen-intro',
      '/dotnet/docs/running-tests',
      '/dotnet/docs/trace-viewer-intro',
      '/dotnet/docs/test-configuration',
      '/dotnet/docs/ci',
      '/dotnet/docs/browsers',
      '/dotnet/docs/test-assertions',
      '/dotnet/docs/locators',
      '/dotnet/docs/input',
      '/dotnet/docs/actionability',
      '/dotnet/docs/test-annotations',
      '/dotnet/docs/pom',
      '/dotnet/docs/auth',
      '/dotnet/docs/test-parallel',
      '/dotnet/docs/api/class-playwright',
      '/dotnet/docs/api/class-browser',
      '/dotnet/docs/api/class-page',
    ];

    for (let i = 0; i < pages.length; i++) {
      const url = `https://playwright.dev${pages[i]}`;
      currentTest.log.info(`Step ${i + 1}/${pages.length}: ${pages[i]}`);
      await page.goto(url);
      await expect(page).toHaveTitle(/Playwright/);
      currentTest.attachScreenshot(await page.screenshot());

      await page.evaluate(() => window.scrollBy(0, 600));
      await page.waitForTimeout(400);
      currentTest.attachScreenshot(await page.screenshot());

      if (i % 2 === 0) {
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
        await page.waitForTimeout(400);
        currentTest.attachScreenshot(await page.screenshot());
      }
    }

    currentTest.log.info(`.NET docs walkthrough finished — ${pages.length} pages visited`);
  });

  test('API classes A-F deep dive [@large, @slow]', async ({ page }) => {
    test.setTimeout(120_000);
    zebrunner.testCaseKey('DEF-7');
    currentTest.setMaintainer('admin');
    currentTest.attachLabel('scope', 'api-half1', 'e2e');

    const apiClasses = [
      'class-accessibility',
      'class-apirequest',
      'class-apirequestcontext',
      'class-apiresponse',
      'class-apiresponseassertions',
      'class-browser',
      'class-browsercontext',
      'class-browsertype',
      'class-consolemessage',
      'class-dialog',
      'class-download',
      'class-elementhandle',
      'class-filechooser',
      'class-frame',
      'class-framelocator',
    ];

    for (let i = 0; i < apiClasses.length; i++) {
      const cls = apiClasses[i];
      const displayName = cls.replace('class-', '');
      currentTest.log.info(`Step ${i + 1}/${apiClasses.length}: ${displayName}`);
      await page.goto(`https://playwright.dev/docs/api/${cls}`);
      await expect(page).toHaveURL(new RegExp(cls));
      currentTest.attachScreenshot(await page.screenshot());

      await page.evaluate(() => window.scrollBy(0, 500));
      await page.waitForTimeout(350);
      currentTest.attachScreenshot(await page.screenshot());

      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(350);
      currentTest.log.info(`Reached bottom of ${displayName}`);
      currentTest.attachScreenshot(await page.screenshot());

      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(250);
    }

    currentTest.log.info('Searching from API docs');
    const searchTerms = ['getByRole', 'getByText', 'getByLabel', 'getByPlaceholder'];
    for (const term of searchTerms) {
      const searchButton = page.getByRole('button', { name: 'Search' });
      await searchButton.click();
      const searchInput = page.locator('.DocSearch-Input');
      await expect(searchInput).toBeVisible({ timeout: 5000 });
      await searchInput.fill(term);
      await page.waitForTimeout(1500);
      const hitItems = page.locator('.DocSearch-Hit');
      await expect(hitItems.first()).toBeVisible({ timeout: 10_000 });
      currentTest.log.info(`Search "${term}": found ${await hitItems.count()} results`);
      currentTest.attachScreenshot(await page.screenshot());
      await hitItems.first().click();
      await page.waitForLoadState('domcontentloaded');
      currentTest.attachScreenshot(await page.screenshot());
    }

    currentTest.log.info(`API A-F deep dive finished — ${apiClasses.length} classes + ${searchTerms.length} searches`);
  });

  test('API classes J-T deep dive [@large, @slow]', async ({ page }) => {
    test.setTimeout(120_000);
    zebrunner.testCaseKey('DEF-8');
    currentTest.setMaintainer('admin');
    currentTest.attachLabel('scope', 'api-half2', 'e2e');

    const apiClasses = [
      'class-jshandle',
      'class-keyboard',
      'class-locator',
      'class-locatorassertions',
      'class-mouse',
      'class-page',
      'class-pageassertions',
      'class-playwright',
      'class-request',
      'class-response',
      'class-route',
      'class-selectors',
      'class-snapshotassertions',
      'class-touchscreen',
      'class-tracing',
    ];

    for (let i = 0; i < apiClasses.length; i++) {
      const cls = apiClasses[i];
      const displayName = cls.replace('class-', '');
      currentTest.log.info(`Step ${i + 1}/${apiClasses.length}: ${displayName}`);
      await page.goto(`https://playwright.dev/docs/api/${cls}`);
      await expect(page).toHaveURL(new RegExp(cls));
      currentTest.attachScreenshot(await page.screenshot());

      await page.evaluate(() => window.scrollBy(0, 500));
      await page.waitForTimeout(350);
      currentTest.attachScreenshot(await page.screenshot());

      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(350);
      currentTest.log.info(`Reached bottom of ${displayName}`);
      currentTest.attachScreenshot(await page.screenshot());

      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(250);
    }

    currentTest.log.info('Searching from API docs');
    const searchTerms = ['toBeVisible', 'toHaveText', 'toHaveURL', 'toBeEnabled'];
    for (const term of searchTerms) {
      const searchButton = page.getByRole('button', { name: 'Search' });
      await searchButton.click();
      const searchInput = page.locator('.DocSearch-Input');
      await expect(searchInput).toBeVisible({ timeout: 5000 });
      await searchInput.fill(term);
      await page.waitForTimeout(1500);
      const hitItems = page.locator('.DocSearch-Hit');
      await expect(hitItems.first()).toBeVisible({ timeout: 10_000 });
      currentTest.log.info(`Search "${term}": found ${await hitItems.count()} results`);
      currentTest.attachScreenshot(await page.screenshot());
      await hitItems.first().click();
      await page.waitForLoadState('domcontentloaded');
      currentTest.attachScreenshot(await page.screenshot());
    }

    currentTest.log.info(`API J-T deep dive finished — ${apiClasses.length} classes + ${searchTerms.length} searches`);
  });

});
