/**
 * Shared Playwright Android fixtures — import `test` and `expect` from here
 * instead of from '@playwright/test' in every spec file.
 *
 * Provides: androidDevice, androidContext, page (overrides built-in), caps.
 *
 * Two connection modes (auto-detected by env):
 *   A) ANDROID_WS_ENDPOINT → android.connect(wsEndpoint)
 *   B) ADB_SERVER_HOST / ADB_SERVER_PORT → android.devices(…)
 *
 * Capabilities (ZEBRUNNER_CAPABILITIES or ANDROID_CAPS — JSON string):
 *   All fields are optional. Full list from androidDevice.launchBrowser():
 *
 *   ── Device selection (not passed to launchBrowser) ──
 *   deviceName        — for logging / identification
 *   serial            — overrides ANDROID_SERIAL env
 *
 *   ── Browser launch / context options ──
 *   acceptDownloads   — boolean, default true
 *   args              — string[], extra Chrome flags
 *   baseURL           — string, prepended to relative goto() paths
 *   bypassCSP         — boolean
 *   colorScheme       — "light" | "dark" | "no-preference" | null
 *   contrast          — "no-preference" | "more" | null
 *   deviceScaleFactor — number (dpr)
 *   extraHTTPHeaders  — { [key]: string }
 *   forcedColors      — "active" | "none" | null
 *   geolocation       — { latitude, longitude, accuracy? }
 *   hasTouch          — boolean
 *   httpCredentials   — { username, password, origin?, send? }
 *   ignoreHTTPSErrors — boolean
 *   isMobile          — boolean
 *   javaScriptEnabled — boolean
 *   locale            — string, e.g. "en-US"
 *   offline           — boolean
 *   permissions       — string[], e.g. ["geolocation"]
 *   pkg               — string, launch a different browser APK package
 *   proxy             — { server, bypass?, username?, password? }
 *   recordHar         — { path, omitContent?, content?, mode?, urlFilter? }
 *   recordVideo       — { dir, size?: { width, height } }
 *   reducedMotion     — "reduce" | "no-preference" | null
 *   screen            — { width, height }
 *   serviceWorkers    — "allow" | "block"
 *   strictSelectors   — boolean
 *   timezoneId        — string, e.g. "America/New_York"
 *   userAgent         — string
 *   viewport          — { width, height } | null
 */
const { test: base, expect } = require('@playwright/test');
const { _android: android } = require('playwright');

const wsEndpoint = process.env.ANDROID_WS_ENDPOINT || '';
const adbHost = process.env.ADB_SERVER_HOST || '127.0.0.1';
const adbPort = parseInt(process.env.ADB_SERVER_PORT || '5037', 10);
const omitDriver = process.env.ANDROID_OMIT_DRIVER_INSTALL === 'true';

function parseCaps() {
  const raw = process.env.ZEBRUNNER_CAPABILITIES || process.env.ANDROID_CAPS || '';
  if (!raw) return {};
  try { return JSON.parse(raw); } catch { return {}; }
}

const caps = parseCaps();
const serial = caps.serial || process.env.ANDROID_SERIAL || '';

const LAUNCH_BROWSER_KEYS = [
  'acceptDownloads', 'args', 'baseURL', 'bypassCSP',
  'colorScheme', 'contrast', 'deviceScaleFactor',
  'extraHTTPHeaders', 'forcedColors',
  'geolocation', 'hasTouch', 'httpCredentials',
  'ignoreHTTPSErrors', 'isMobile', 'javaScriptEnabled',
  'locale', 'offline', 'permissions', 'pkg', 'proxy',
  'recordHar', 'recordVideo', 'reducedMotion',
  'screen', 'serviceWorkers', 'strictSelectors',
  'timezoneId', 'userAgent', 'viewport',
];

function buildLaunchBrowserOptions() {
  const opts = {};
  for (const key of LAUNCH_BROWSER_KEYS) {
    if (caps[key] !== undefined) opts[key] = caps[key];
  }
  return opts;
}

const test = base.extend({
  caps: [caps, { option: true }],

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
    const context = await androidDevice.launchBrowser(buildLaunchBrowserOptions());
    await use(context);
    await context.close();
  },

  page: async ({ androidContext }, use) => {
    const page = await androidContext.newPage();
    await use(page);
  },
});

module.exports = { test, expect };