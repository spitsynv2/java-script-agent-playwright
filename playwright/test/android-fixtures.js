/**
 * Shared Playwright Android fixtures — import `test` and `expect` from here
 * instead of from '@playwright/test' in every spec file.
 *
 * Provides: androidDevice, androidContext, page (overrides built-in).
 *
 * Two connection modes (auto-detected by env):
 *   A) ANDROID_WS_ENDPOINT → android.connect(wsEndpoint)
 *   B) ADB_SERVER_HOST / ADB_SERVER_PORT → android.devices(…)
 */
const { test: base, expect } = require('@playwright/test');
const { _android: android } = require('playwright');

const wsEndpoint = process.env.ANDROID_WS_ENDPOINT || '';
const adbHost = process.env.ADB_SERVER_HOST || '127.0.0.1';
const adbPort = parseInt(process.env.ADB_SERVER_PORT || '5037', 10);
const serial = process.env.ANDROID_SERIAL || '';
const omitDriver = process.env.ANDROID_OMIT_DRIVER_INSTALL === 'true';

const test = base.extend({
  androidDevice: async ({}, use) => {
    let device;

    if (wsEndpoint) {
      device = await android.connect(wsEndpoint, { timeout: 60_000 });
    } else {
      const list = await android.devices({
        host: adbHost,
        port: adbPort,
        omitDriverInstall: omitDriver,
      });
      if (!list.length) {
        throw new Error(
          `No Android devices from ADB at ${adbHost}:${adbPort}. ` +
            'Ensure the device is authorized and `adb devices` lists it.',
        );
      }
      device = list[0];
      if (serial) {
        const match = list.find((d) => d.serial() === serial);
        if (!match) {
          throw new Error(
            `ANDROID_SERIAL=${serial} not found. Available: ${list.map((d) => d.serial()).join(', ')}`,
          );
        }
        for (const d of list) {
          if (d.serial() !== serial) await d.close();
        }
        device = match;
      } else if (list.length > 1) {
        throw new Error(
          `Multiple devices (${list.length}). Set ANDROID_SERIAL to one of: ${list.map((d) => d.serial()).join(', ')}`,
        );
      }
    }

    await use(device);
    await device.close();
  },

  androidContext: async ({ androidDevice }, use) => {
    await androidDevice.shell('am force-stop com.android.chrome');
    const context = await androidDevice.launchBrowser();
    await use(context);
    await context.close();
  },

  page: async ({ androidContext }, use) => {
    const page = await androidContext.newPage();
    await use(page);
  },
});

module.exports = { test, expect };
