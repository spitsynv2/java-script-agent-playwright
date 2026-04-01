const { defineConfig, devices } = require('@playwright/test');

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// require('dotenv').config();

// Connect to Zebrunner Hub via Selenium Grid (experimental)
// https://playwright.dev/docs/selenium-grid
const remoteOnly = process.env.REMOTE_ONLY !== 'false';
const useRemoteGrid = !!process.env.ZEBRUNNER_HUB_URL;
const diagnosticRemote = process.env.DIAGNOSTIC_REMOTE === 'true';
if (remoteOnly && !useRemoteGrid) {
  throw new Error('REMOTE_ONLY mode is enabled but ZEBRUNNER_HUB_URL is not set.');
}
if (useRemoteGrid) {
  process.env.SELENIUM_REMOTE_URL = process.env.ZEBRUNNER_HUB_URL;
  if (process.env.ZEBRUNNER_CAPABILITIES) {
    process.env.SELENIUM_REMOTE_CAPABILITIES = process.env.ZEBRUNNER_CAPABILITIES;
  }
}

function maskUrlCredentials(rawUrl) {
  try {
    const parsed = new URL(rawUrl);
    if (parsed.username || parsed.password) {
      parsed.username = '***';
      parsed.password = '***';
    }
    return parsed.toString();
  } catch (_) {
    return rawUrl;
  }
}

if (remoteOnly) {
  const remoteUrl = process.env.SELENIUM_REMOTE_URL || '';
  if (!remoteUrl) {
    throw new Error('REMOTE_ONLY mode is enabled but SELENIUM_REMOTE_URL is empty.');
  }
  if (/localhost|127\.0\.0\.1/.test(remoteUrl)) {
    throw new Error(`REMOTE_ONLY mode: SELENIUM_REMOTE_URL looks local (${remoteUrl}).`);
  }
  const caps = process.env.SELENIUM_REMOTE_CAPABILITIES || '{}';
  console.log(`[REMOTE_ONLY] enabled=true`);
  console.log(`[REMOTE_ONLY] selenium_url=${maskUrlCredentials(remoteUrl)}`);
  console.log(`[REMOTE_ONLY] capabilities=${caps}`);
  // Emit transport logs so each run clearly proves Selenium path.
  if (!process.env.DEBUG) {
    process.env.DEBUG = 'pw:browser*';
  } else if (!process.env.DEBUG.includes('pw:browser*')) {
    process.env.DEBUG = `${process.env.DEBUG},pw:browser*`;
  }
}

if (diagnosticRemote) {
  console.log('[DIAGNOSTIC_REMOTE] enabled=true');
  console.log('[DIAGNOSTIC_REMOTE] forcing retries=0, video=off, trace=off');
}

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
      if (!useRemoteGrid) {
        channel = CHANNEL_MAP[caps.browserName];
      }
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

/**
 * See https://playwright.dev/docs/test-configuration.
 */
module.exports = defineConfig({
  testDir: './test',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: diagnosticRemote ? 0 : (process.env.CI ? 2 : 0),
  workers: process.env.PW_WORKERS ? parseInt(process.env.PW_WORKERS, 10) : (process.env.CI ? 1 : undefined),

  use: {
    trace: diagnosticRemote ? 'off' : 'on-first-retry',
    screenshot: 'on',
    video: diagnosticRemote ? 'off' : 'on',
  },

  projects: [
    {
      name: browserName,
      use: {
        ...devicePreset,
        ...(userAgent ? { userAgent } : {}),
        ...(channel ? { channel } : {}),
        ...(!useRemoteGrid ? {
          launchOptions: {
            args: browserEngine === 'firefox'
              ? ['-no-remote']
              : ['--no-sandbox'],
            firefoxUserPrefs: browserEngine === 'firefox'
              ? { 'security.sandbox.content.level': 0 }
              : undefined,
          },
        } : {}),
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
