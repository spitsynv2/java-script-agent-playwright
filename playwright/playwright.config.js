const { defineConfig, devices } = require('@playwright/test');
require('dotenv').config();

const wsEndpoint = process.env.PLAYWRIGHT_WS_ENDPOINT;
const isGrid = !!wsEndpoint;

const playwrightVersion = require('@playwright/test/package.json').version;

// Selenium/platform browserName → Playwright browserName + device preset
const BROWSER_MAP = {
  'chrome':               { pwName: 'playwright-chrome',    device: 'Desktop Chrome' },
  'chromium':             { pwName: 'playwright-chromium',  device: 'Desktop Chrome' },
  'firefox':              { pwName: 'playwright-firefox',   device: 'Desktop Firefox' },
  'webkit':               { pwName: 'playwright-webkit',    device: 'Desktop Safari' },
  'safari':               { pwName: 'playwright-webkit',    device: 'Desktop Safari' },
  'edge':                 { pwName: 'playwright-edge',      device: 'Desktop Edge' },
  'microsoftedge':        { pwName: 'playwright-edge',      device: 'Desktop Edge' },
  'playwright-chromium':  { pwName: 'playwright-chromium',  device: 'Desktop Chrome' },
  'playwright-chrome':    { pwName: 'playwright-chrome',    device: 'Desktop Chrome' },
  'playwright-firefox':   { pwName: 'playwright-firefox',   device: 'Desktop Firefox' },
  'playwright-webkit':    { pwName: 'playwright-webkit',    device: 'Desktop Safari' },
  'playwright-edge':      { pwName: 'playwright-edge',      device: 'Desktop Edge' },
};

const DEFAULT_BROWSER = { pwName: 'playwright-chromium', device: 'Desktop Chrome' };

// Parse ZEBRUNNER_CAPABILITIES — handles both plain keys (browserName)
// and vendor-prefixed keys (zebrunner:enableVNC, zebrunner:cpu).
// Values may be strings ("true", "2064") that need type conversion.
function parseZebrunnerCaps() {
  const result = { browser: DEFAULT_BROWSER, zebrOptions: {} };
  if (!process.env.ZEBRUNNER_CAPABILITIES) return result;

  try {
    const raw = JSON.parse(process.env.ZEBRUNNER_CAPABILITIES);

    if (raw.browserName) {
      result.browser = BROWSER_MAP[raw.browserName.toLowerCase()] || DEFAULT_BROWSER;
    }

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

const { browser: selectedBrowser, zebrOptions: parentZebrOptions } = parseZebrunnerCaps();
const browserName = selectedBrowser.pwName;
const devicePreset = devices[selectedBrowser.device];

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

// Build full W3C capabilities — same format as Selenium POST /session body.
// The hub feeds this through ParseRequestCapabilities() unchanged.
function gridConnectOptions(overrides = {}) {
  if (!isGrid) return {};

  const zebrOptions = {
    ...parentZebrOptions,
    ...overrides,
  };

  const capsBody = {
    capabilities: {
      alwaysMatch: {
        platformName: 'playwright',
        browserName,
        browserVersion: playwrightVersion,
        'zebrunner:options': zebrOptions,
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
const fullyParallel = process.env.PW_FULLY_PARALLEL === 'false' ? false : true;
const lightReport = process.env.PW_LIGHT_REPORT !== 'false';

module.exports = defineConfig({
  testDir: './test',
  fullyParallel,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers,

  use: {
    screenshot: lightReport ? 'only-on-failure' : 'on',
    trace: (isGrid || lightReport) ? 'off' : 'on-first-retry',
    ...gridConnectOptions(),
  },

  projects: [
    {
      name: browserName,
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
          environment: isGrid ? 'ESG Grid' : 'Local',
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
