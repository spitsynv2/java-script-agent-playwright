const { defineConfig } = require('@playwright/test');
require('dotenv').config();

module.exports = defineConfig({
  testDir: './test',
  testMatch: /ios-safari\.spec\.js/,
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: 0,

  timeout: 180_000,
  expect: { timeout: 30_000 },

  use: {
    screenshot: 'off',
    trace: 'off',
    video: 'off',
  },

  projects: [
    { name: 'ios-safari', testMatch: /ios-safari\.spec\.js/ },
  ],
});
