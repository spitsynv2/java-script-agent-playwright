/**
 * iOS Safari fixtures — uses webkit.connect() for real Playwright API.
 *
 * Env:
 *   IOS_WS_ENDPOINT — WebSocket URL to the Safari bridge
 *   IOS_DEVICE_NAME — Playwright device preset (default: "iPhone 15")
 */
const { test: base, expect, webkit, devices } = require('@playwright/test');

const wsEndpoint = process.env.IOS_WS_ENDPOINT || '';
const deviceName = process.env.IOS_DEVICE_NAME || 'iPhone_XR';
const devicePreset = devices[deviceName] || devices['iPhone_XR'];

const test = base.extend({
  browser: async ({}, use) => {
    if (!wsEndpoint) {
      const browser = await webkit.launch();
      await use(browser);
      await browser.close();
      return;
    }

    const browser = await webkit.connect(wsEndpoint, { timeout: 120_000 });
    await use(browser);
    await browser.close();
  },

  context: async ({ browser }, use) => {
    const context = await browser.newContext({ ...devicePreset });
    await use(context);
    await context.close();
  },

  page: async ({ context }, use) => {
    const page = await context.newPage();
    await use(page);
  },
});

module.exports = { test, expect };
