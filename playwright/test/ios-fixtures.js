/**
 * iOS Safari fixtures — uses webkit.connect() for real Playwright API.
 *
 * Env:
 *   IOS_WS_ENDPOINT  — WebSocket URL to the Safari bridge
 *                       e.g. ws://safari-bridge:3000/safari
 *   IOS_DEVICE_NAME  — Playwright device preset (default: "iPhone_XR")
 *   IOS_DEVICE_SCALE — Device scale factor override (default: from preset)
 */
const { test: base, expect, webkit, devices } = require('@playwright/test');

const wsEndpoint = process.env.IOS_WS_ENDPOINT || '';
const deviceName = process.env.IOS_DEVICE_NAME || 'iPhone_XR';
const devicePreset = devices[deviceName] || {};
const deviceScaleFactor = process.env.IOS_DEVICE_SCALE
  ? parseFloat(process.env.IOS_DEVICE_SCALE)
  : undefined;

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
    const contextOptions = { ...devicePreset };
    if (deviceScaleFactor) contextOptions.deviceScaleFactor = deviceScaleFactor;
    const context = await browser.newContext(contextOptions);
    await use(context);
    await context.close();
  },

  page: async ({ context }, use) => {
    const page = await context.newPage();
    await use(page);
  },
});

module.exports = { test, expect };
