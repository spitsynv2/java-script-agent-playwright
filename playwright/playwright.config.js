/**
 * This branch runs only real-device Android tests (see test/specs/android-real.spec.js).
 *
 * Remote server — install/run:
 *   - Node.js LTS + npm; clone repo; `cd playwright && npm ci`
 *   - Android device visible to ADB: `adb devices` must show one device (or set ANDROID_SERIAL)
 *   - Android SDK platform-tools (`adb`) on PATH if you use USB or local `adb start-server`
 *   - Chrome on the device (87+); chrome://flags → enable "command line on non-rooted devices"
 *   - Network: tests need HTTPS to targets (playwright.dev, etc.); ADB may be TCP — set ADB_SERVER_*
 *   - Multi-host: each runner machine uses its own .env (or CI vars) with the right ANDROID_SERIAL
 *   - Multi-device on one host: run separate jobs with different ANDROID_SERIAL
 *
 * You do not need `npx playwright install` for desktop Chromium — the browser runs on the phone.
 *
 * Env:
 *   ADB_SERVER_HOST, ADB_SERVER_PORT — adb server (default 127.0.0.1:5037)
 *   ANDROID_SERIAL — which device when several are connected
 *   ANDROID_OMIT_DRIVER_INSTALL — "true" if Playwright drivers already on device
 *
 * @see https://playwright.dev/docs/api/class-android
 */
const { defineConfig } = require('@playwright/test');
require('dotenv').config();

module.exports = defineConfig({
  testDir: './test',
  testMatch: /android-real\.spec\.js/,
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,

  timeout: 180_000,
  expect: { timeout: 30_000 },

  use: {
    trace: 'on-first-retry',
    screenshot: 'on',
    video: 'off',
  },

  projects: [{ name: 'android-real-chrome', testMatch: /android-real\.spec\.js/ }],
});
