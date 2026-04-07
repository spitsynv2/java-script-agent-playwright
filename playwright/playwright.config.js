const { defineConfig, devices } = require('@playwright/test');
require('dotenv').config();

const wsEndpoint = process.env.PLAYWRIGHT_WS_ENDPOINT;
const isGrid = !!wsEndpoint;

const playwrightVersion = require('@playwright/test/package.json').version;

// iOS always uses WebKit (Safari) — all browsers on real iOS are WebKit under the hood.
const browserName = 'playwright-webkit';

function parseZebrunnerCaps() {
  const result = { zebrOptions: {} };
  if (!process.env.ZEBRUNNER_CAPABILITIES) return result;

  try {
    const raw = JSON.parse(process.env.ZEBRUNNER_CAPABILITIES);
    const ZEBR_PREFIX = 'zebrunner:';
    for (const [key, val] of Object.entries(raw)) {
      const name = key.startsWith(ZEBR_PREFIX) ? key.slice(ZEBR_PREFIX.length) : null;
      if (!name) continue;

      if (val === 'true') result.zebrOptions[name] = true;
      else if (val === 'false') result.zebrOptions[name] = false;
      else if (/^\d+$/.test(val)) result.zebrOptions[name] = parseInt(val, 10);
      else result.zebrOptions[name] = val;
    }
  } catch (e) { /* ignore */ }

  return result;
}

const { zebrOptions: parentZebrOptions } = parseZebrunnerCaps();

function getAuthHeader() {
  const hubUrl = process.env.ZEBRUNNER_HUB_URL;
  if (!hubUrl) return {};
  try {
    const parsed = new URL(hubUrl);
    if (parsed.username) {
      const auth = Buffer.from(`${parsed.username}:${parsed.password}`).toString('base64');
      return { 'Authorization': `Basic ${auth}` };
    }
  } catch (e) { /* ignore */ }
  return {};
}

function gridConnectOptions(overrides = {}) {
  if (!isGrid) return {};

  const capsBody = {
    capabilities: {
      alwaysMatch: {
        platformName: 'playwright',
        browserName,
        browserVersion: playwrightVersion,
        'zebrunner:options': { ...parentZebrOptions, ...overrides },
      },
    },
  };

  return {
    connectOptions: {
      wsEndpoint,
      headers: {
        ...getAuthHeader(),
        'X-Zebrunner-Capabilities': JSON.stringify(capsBody),
      },
      timeout: 600_000,
    },
  };
}

const parsedWorkers = Number.parseInt(process.env.PW_WORKERS || '', 10);
const workers = Number.isFinite(parsedWorkers) && parsedWorkers > 0 ? parsedWorkers : undefined;

module.exports = defineConfig({
  testDir: './test',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers,

  use: {
    screenshot: 'on',
    trace: isGrid ? 'off' : 'on-first-retry',
    video: isGrid ? 'off' : 'on',
    ...gridConnectOptions(),
  },

  projects: [
    {
      name: 'iPhone 15',
      testMatch: /mobile\.spec\.js/,
      use: { ...devices['iPhone 15'] },
    },
    {
      name: 'iPad Pro 11',
      testMatch: /mobile\.spec\.js/,
      use: { ...devices['iPad Pro 11'] },
    },
  ],

  reporter: [
    [
      '@zebrunner/javascript-agent-playwright',
      {
        enabled: process.env.REPORTING_ENABLED === 'true',
        projectKey: process.env.REPORTING_PROJECT_KEY || 'DEF',
        server: {
          hostname: process.env.REPORTING_SERVER_HOSTNAME || 'https://yourCompany.zebrunner.com',
          accessToken: process.env.REPORTING_SERVER_ACCESS_TOKEN || 'yourAccessToken',
        },
        launch: {
          displayName: process.env.REPORTING_LAUNCH_DISPLAY_NAME || 'Playwright iOS Emulators',
          build: '1.0.0',
          environment: isGrid ? 'ESG Grid' : 'Local',
          treatSkipsAsFailures: true,
        },
        logs: {
          ignorePlaywrightSteps: false,
          useLinesFromSourceCode: true,
          ignoreConsole: false,
          ignoreCustom: false,
          ignoreManualScreenshots: false,
          ignoreAutoScreenshots: false,
        },
        milestone: {
          id: null,
          name: null,
        },
        notifications: {
          notifyOnEachFailure: false,
          slackChannels: process.env.REPORTING_NOTIFICATION_SLACK_CHANNELS || '',
          teamsChannels: process.env.REPORTING_NOTIFICATION_MS_TEAMS_CHANNELS || '',
          emails: process.env.REPORTING_NOTIFICATION_EMAILS || '',
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
