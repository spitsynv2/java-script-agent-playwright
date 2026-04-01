const { defineConfig, devices } = require('@playwright/test');

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// require('dotenv').config();

const ENGINE_MAP = { chrome: 'chromium', msedge: 'chromium', firefox: 'firefox', webkit: 'webkit' };
const DEVICE_MAP = { chromium: 'Desktop Chrome', firefox: 'Desktop Firefox', webkit: 'Desktop Safari' };
const CHANNEL_MAP = { chrome: 'chrome', msedge: 'msedge' };

let browserEngine = 'chromium';
let browserName = 'chromium';
let browserVersion = undefined;
let channel = undefined;
if (process.env.ZEBRUNNER_CAPABILITIES) {
  try {
    const caps = JSON.parse(process.env.ZEBRUNNER_CAPABILITIES);
    if (caps.browserName) {
      browserName = caps.browserName;
      browserEngine = ENGINE_MAP[caps.browserName] || 'chromium';
      channel = CHANNEL_MAP[caps.browserName];
    }
    if (caps.browserVersion) {
      browserVersion = caps.browserVersion;
    }
  } catch (e) { /* ignore parse errors */ }
}

const devicePreset = devices[DEVICE_MAP[browserEngine] || 'Desktop Chrome'];
let userAgent = devicePreset.userAgent;
if (browserVersion && userAgent && /^\d+/.test(browserVersion)) {
  userAgent = userAgent.replace(/Chrome\/[\d.]+/, `Chrome/${browserVersion}`);
}

const parsedWorkers = Number.parseInt(process.env.PW_WORKERS || '', 10);
const workers = Number.isFinite(parsedWorkers) && parsedWorkers > 0 ? parsedWorkers : undefined;
const fullyParallel = process.env.PW_FULLY_PARALLEL === 'false' ? false : true;
const lightReport = process.env.PW_LIGHT_REPORT !== 'false';
const runIosOnly = true;

const iosProjects = [
  {
    name: 'ios-phone',
    use: {
      ...devices['iPhone 13'],
      browserName: 'webkit',
    },
  },
  {
    name: 'ios-tablet',
    use: {
      ...devices['iPad Pro 11'],
      browserName: 'webkit',
    },
  },
];

/**
 * See https://playwright.dev/docs/test-configuration.
 */
module.exports = defineConfig({
  testDir: './test',
  fullyParallel,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers,

  use: {
    trace: lightReport ? 'off' : 'on-first-retry',
    screenshot: lightReport ? 'only-on-failure' : 'on',
    video: lightReport ? 'off' : 'on',
  },

  projects: runIosOnly ? iosProjects : [
    {
      name: browserName,
      use: {
        ...devicePreset,
        ...(userAgent ? { userAgent } : {}),
        ...(channel ? { channel } : {}),
        launchOptions: {
          args: browserEngine === 'firefox'
            ? ['-no-remote']
            : ['--no-sandbox'],
          firefoxUserPrefs: browserEngine === 'firefox'
            ? { 'security.sandbox.content.level': 0 }
            : undefined,
        },
      },
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
          environment: 'Local',
          treatSkipsAsFailures: true,
        },
        logs: {
          ignorePlaywrightSteps: false,
          useLinesFromSourceCode: true,
          ignoreConsole: false,
          ignoreCustom: false,
          ignoreManualScreenshots: false,
          ignoreAutoScreenshots: lightReport,
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
        pwConcurrentTasks: 25,
      },
    ],
  ],
});
