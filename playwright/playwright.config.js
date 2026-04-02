const { defineConfig, devices } = require('@playwright/test');
require('dotenv').config();

const wsEndpoint = process.env.PLAYWRIGHT_WS_ENDPOINT;
const isGrid = !!wsEndpoint;

let browserName = 'chromium';
let browserVersion = undefined;
let enableVNC = true;
let enableVideo = true;
if (process.env.ZEBRUNNER_CAPABILITIES) {
  try {
    const caps = JSON.parse(process.env.ZEBRUNNER_CAPABILITIES);
    if (caps.browserName) browserName = caps.browserName.toLowerCase();
    if (caps.browserVersion) browserVersion = caps.browserVersion;
    if (caps.enableVNC === false) enableVNC = false;
    if (caps.enableVideo === false) enableVideo = false;
  } catch (e) { /* ignore */ }
}

const DEVICE_PRESET = {
  chrome: 'Desktop Chrome',
  chromium: 'Desktop Chrome',
  edge: 'Desktop Edge',
  firefox: 'Desktop Firefox',
  webkit: 'Desktop Safari',
  safari: 'Desktop Safari',
};

function gridConnectOptions(overrides = {}) {
  if (!isGrid) return {};

  const caps = {
    browserName,
    browserVersion,
    enableVNC,
    enableVideo,
    ...overrides,
  };

  return {
    connectOptions: {
      wsEndpoint,
      headers: {
        'X-Zebrunner-Capabilities': JSON.stringify(caps),
      },
      timeout: 120_000,
    },
  };
}

const devicePreset = devices[DEVICE_PRESET[browserName] || 'Desktop Chrome'];
const projectName = browserVersion ? `${browserName}-${browserVersion}` : browserName;

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
      name: projectName,
      use: { ...devicePreset },
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
          displayName: process.env.REPORTING_LAUNCH_DISPLAY_NAME || 'Playwright launch',
          build: '1.0.0',
          environment: wsEndpoint ? 'ESG Grid' : 'Local',
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
