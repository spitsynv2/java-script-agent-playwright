const { expect, test } = require('@playwright/test');
const { currentTest, zebrunner } = require('@zebrunner/javascript-agent-playwright');

test.describe('Mobile emulator tests', () => {

  test('has title on mobile viewport [@small, @fast]', async ({ page, browserName }) => {
    zebrunner.testCaseKey('DEF-10');
    currentTest.setMaintainer('admin');
    currentTest.attachLabel('platform', 'mobile');

    currentTest.log.info(`Running on browser: ${browserName}`);
    await page.goto('https://playwright.dev/');

    await expect(page).toHaveTitle(/Playwright/);
    currentTest.attachScreenshot(await page.screenshot());
  });

  test('viewport dimensions match device preset [@small, @fast]', async ({ page }) => {
    zebrunner.testCaseKey('DEF-11');
    currentTest.setMaintainer('admin');
    currentTest.attachLabel('platform', 'mobile');

    await page.goto('https://playwright.dev/');

    const viewport = page.viewportSize();
    currentTest.log.info(`Viewport: ${viewport.width}x${viewport.height}`);

    expect(viewport.width).toBeGreaterThan(0);
    expect(viewport.height).toBeGreaterThan(0);
    currentTest.attachScreenshot(await page.screenshot());
  });

  test('mobile navigation menu toggle [@medium, @fast]', async ({ page }) => {
    zebrunner.testCaseKey('DEF-12');
    currentTest.setMaintainer('admin');
    currentTest.attachLabel('platform', 'mobile');

    await page.goto('https://playwright.dev/');

    const viewport = page.viewportSize();
    currentTest.log.info(`Viewport: ${viewport.width}x${viewport.height}`);

    if (viewport.width < 997) {
      const menuToggle = page.locator('button.navbar__toggle');
      await expect(menuToggle).toBeVisible();
      currentTest.log.info('Mobile hamburger menu is visible');

      await menuToggle.click();
      await page.waitForTimeout(500);
      currentTest.attachScreenshot(await page.screenshot());

      const sidebar = page.locator('.navbar-sidebar');
      await expect(sidebar).toBeVisible();
      currentTest.log.info('Sidebar navigation opened successfully');

      currentTest.attachScreenshot(await page.screenshot());
    } else {
      currentTest.log.info('Viewport too wide for mobile menu — verifying desktop nav instead');
      const navLinks = page.locator('.navbar__items a');
      await expect(navLinks.first()).toBeVisible();
      currentTest.attachScreenshot(await page.screenshot());
    }
  });

  test('get started link works on mobile [@medium, @fast]', async ({ page }) => {
    zebrunner.testCaseKey('DEF-13');
    currentTest.setMaintainer('admin');
    currentTest.attachLabel('platform', 'mobile');

    await page.goto('https://playwright.dev/');

    const getStartedLink = page.getByRole('link', { name: 'Get started' });
    await expect(getStartedLink).toBeVisible();
    currentTest.attachScreenshot(await page.screenshot());

    await getStartedLink.click();
    await expect(page.getByRole('heading', { name: 'Installation' })).toBeVisible();

    currentTest.log.info('Successfully navigated to Installation page on mobile');
    currentTest.attachScreenshot(await page.screenshot());
  });

  test('page scrolling on mobile viewport [@medium, @fast]', async ({ page }) => {
    zebrunner.testCaseKey('DEF-14');
    currentTest.setMaintainer('admin');
    currentTest.attachLabel('platform', 'mobile');

    await page.goto('https://playwright.dev/docs/intro');
    await expect(page.getByRole('heading', { name: 'Installation' })).toBeVisible();

    currentTest.log.info('Scrolling down the page');
    await page.evaluate(() => window.scrollBy(0, 800));
    await page.waitForTimeout(400);
    currentTest.attachScreenshot(await page.screenshot());

    currentTest.log.info('Scrolling to bottom');
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(400);
    currentTest.attachScreenshot(await page.screenshot());

    currentTest.log.info('Scrolling back to top');
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(400);
    currentTest.attachScreenshot(await page.screenshot());
  });

  test('touch-friendly elements are accessible [@medium, @fast]', async ({ page }) => {
    zebrunner.testCaseKey('DEF-15');
    currentTest.setMaintainer('admin');
    currentTest.attachLabel('platform', 'mobile');

    await page.goto('https://playwright.dev/');

    const heroButtons = page.locator('.hero__subtitle a, a.button');
    const count = await heroButtons.count();
    currentTest.log.info(`Found ${count} hero/button links`);

    for (let i = 0; i < count; i++) {
      const btn = heroButtons.nth(i);
      if (await btn.isVisible()) {
        const box = await btn.boundingBox();
        if (box) {
          currentTest.log.info(`Button ${i}: ${box.width.toFixed(0)}x${box.height.toFixed(0)} at (${box.x.toFixed(0)}, ${box.y.toFixed(0)})`);
          expect(box.height).toBeGreaterThanOrEqual(30);
        }
      }
    }

    currentTest.attachScreenshot(await page.screenshot());
  });

  test('responsive images load correctly [@medium, @fast]', async ({ page }) => {
    zebrunner.testCaseKey('DEF-16');
    currentTest.setMaintainer('admin');
    currentTest.attachLabel('platform', 'mobile');

    await page.goto('https://playwright.dev/');

    const images = page.locator('img');
    const imgCount = await images.count();
    currentTest.log.info(`Found ${imgCount} images on the page`);

    for (let i = 0; i < Math.min(imgCount, 10); i++) {
      const img = images.nth(i);
      if (await img.isVisible()) {
        const naturalWidth = await img.evaluate((el) => el.naturalWidth);
        currentTest.log.info(`Image ${i}: naturalWidth=${naturalWidth}`);
        expect(naturalWidth).toBeGreaterThan(0);
      }
    }

    currentTest.attachScreenshot(await page.screenshot());
  });

  test('docs guide walkthrough on mobile [@large, @slow]', async ({ page }) => {
    test.setTimeout(120_000);
    zebrunner.testCaseKey('DEF-17');
    currentTest.setMaintainer('admin');
    currentTest.attachLabel('platform', 'mobile');
    currentTest.attachLabel('scope', 'navigation', 'docs', 'e2e');

    const docPages = [
      { label: 'Homepage', url: 'https://playwright.dev/', titlePattern: /Playwright/ },
      { label: 'Installation', url: 'https://playwright.dev/docs/intro', heading: 'Installation' },
      { label: 'Writing Tests', url: 'https://playwright.dev/docs/writing-tests', heading: 'Writing tests' },
      { label: 'Generating Tests', url: 'https://playwright.dev/docs/codegen-intro', urlPattern: /codegen/ },
      { label: 'Running Tests', url: 'https://playwright.dev/docs/running-tests', urlPattern: /running-tests/ },
      { label: 'Trace Viewer', url: 'https://playwright.dev/docs/trace-viewer-intro', urlPattern: /trace-viewer/ },
      { label: 'Locators', url: 'https://playwright.dev/docs/locators', urlPattern: /locators/ },
      { label: 'Assertions', url: 'https://playwright.dev/docs/test-assertions', urlPattern: /test-assertions/ },
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

    currentTest.log.info(`Mobile walkthrough finished — ${docPages.length} pages visited`);
  });

  test('API reference on mobile [@large, @slow]', async ({ page }) => {
    test.setTimeout(120_000);
    zebrunner.testCaseKey('DEF-18');
    currentTest.setMaintainer('admin');
    currentTest.attachLabel('platform', 'mobile');
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
      'class-keyboard',
      'class-mouse',
      'class-touchscreen',
    ];

    for (let i = 0; i < apiClasses.length; i++) {
      const cls = apiClasses[i];
      const displayName = cls.replace('class-', '');
      currentTest.log.info(`Step ${i + 1}/${apiClasses.length}: ${displayName}`);
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
      }
    }

    currentTest.log.info(`Mobile API deep dive finished — ${apiClasses.length} classes`);
  });

  test('cross-language docs on mobile [@large, @slow]', async ({ page }) => {
    test.setTimeout(120_000);
    zebrunner.testCaseKey('DEF-19');
    currentTest.setMaintainer('admin');
    currentTest.attachLabel('platform', 'mobile');
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
    ];

    for (const lang of languages) {
      currentTest.log.info(`=== ${lang.name} docs on mobile (${docPaths.length} pages) ===`);

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
    }

    currentTest.log.info(`Mobile cross-language exploration finished — ${languages.length} languages x ${docPaths.length} pages`);
  });

});
