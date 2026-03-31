const { defineConfig, devices } = require('@playwright/test');

const BROWSER = process.env.BROWSER || 'chromium';
const BROWSER_CHANNEL = process.env.BROWSER_CHANNEL || undefined;

const DEVICE_MAP = {
  chromium: 'Desktop Chrome',
  firefox: 'Desktop Firefox',
  webkit: 'Desktop Safari',
};

/**
 * See https://playwright.dev/docs/test-configuration.
 */
module.exports = defineConfig({
  testDir: './test',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,

  use: {
    baseURL: 'https://www.ebay.com',
    trace: 'on-first-retry',
    screenshot: 'on',
    viewport: { width: 1920, height: 1080 },
  },

  projects: [
    {
      name: BROWSER,
      use: {
        ...devices[DEVICE_MAP[BROWSER] || 'Desktop Chrome'],
        channel: BROWSER_CHANNEL,
        launchOptions: {
          headless: false,
          args: BROWSER === 'chromium'
            ? ['--disable-blink-features=AutomationControlled']
            : [],
        },
      },
    },
  ],

  reporter: [
    [
      '@zebrunner/javascript-agent-playwright',
      {
        enabled: true,
        projectKey: 'DEF',
        server: {
          hostname: 'https://yourCompany.zebrunner.com',
          accessToken: 'yourAccessToken',
        },
        launch: {
          displayName: 'Playwright launch',
          build: '1.0.0',
          environment: 'Local',
        },
        milestone: {
          id: null,
          name: null,
        },
        notifications: {
          notifyOnEachFailure: false,
          slackChannels: 'dev, qa',
          teamsChannels: 'dev-channel, management',
          emails: 'yourEmail@solvd.com',
        },
        tcm: {
          zebrunner: {
            pushResults: false,
            pushInRealTime: false,
            testRunId: 1,
          },
          testRail: {
            pushResults: false,
            pushInRealTime: false,
            suiteId: 1,
            runId: 1,
            includeAllTestCasesInNewRun: false,
            runName: 'New Demo Run',
            milestoneName: 'Demo Milestone',
            assignee: 'tester@mycompany.com',
          },
          xray: {
            pushResults: false,
            pushInRealTime: false,
            executionKey: 'ZEB-1',
          },
          zephyr: {
            pushResults: false,
            pushInRealTime: false,
            jiraProjectKey: 'ZEB',
            testCycleKey: 'ZEB-R1',
          },
        },
        pwConcurrentTasks: 10,
      },
    ],
  ],
});
