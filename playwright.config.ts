import { defineConfig, devices } from '@playwright/test';
import { environment } from './config/environment';

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
    testDir: './tests',
    /* Run tests in files in parallel */
    fullyParallel: true,
    /* Fail the build on CI if you accidentally left test.only in the source code. */
    forbidOnly: !!process.env.CI,
    /* Retry on CI only */
    retries: process.env.CI ? 2 : 0,
    /* Opt out of parallel tests on CI. */
    workers: process.env.CI ? 1 : undefined,
    /* Reporter to use. See https://playwright.dev/docs/test-reporters */
    reporter: [
        ['html', { outputFolder: 'playwright-report' }],
        ['junit', { outputFile: 'test-results/results.xml' }],
        ['list'],
    ],
    /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
    use: {
        /* Base URL to use in actions like `await page.goto('/')`. */
        baseURL: environment.baseUrl,

        /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
        trace: 'retain-on-failure',

        /* Take screenshot only on failures */
        screenshot: 'only-on-failure',

        /* Record video only on failures */
        video: 'retain-on-failure',

        /* Global timeout for each action */
        actionTimeout: 15000,

        /* Global navigation timeout */
        navigationTimeout: environment.timeout,
    },

    /* Configure projects for major browsers */
    projects: [
        // Web Testing Projects - Default: Chromium only
        {
            name: 'chromium',
            use: {
                ...devices['Desktop Chrome'],
                viewport: { width: 1280, height: 720 },
            },
            testMatch: '**/web/**/*.spec.ts',
        },

        // Uncomment below browsers when needed for cross-browser testing
        // {
        //     name: 'firefox',
        //     use: {
        //         ...devices['Desktop Firefox'],
        //         viewport: { width: 1280, height: 720 },
        //     },
        //     testMatch: '**/web/**/*.spec.ts',
        // },

        // {
        //     name: 'webkit',
        //     use: {
        //         ...devices['Desktop Safari'],
        //         viewport: { width: 1280, height: 720 },
        //     },
        //     testMatch: '**/web/**/*.spec.ts',
        // },

        /* API Testing Project */
        {
            name: 'api-tests',
            testMatch: '**/api/**/*.spec.ts',
            use: {
                baseURL: environment.apiUrl,
                extraHTTPHeaders: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
            },
        },
    ],

    /* Run your local dev server before starting the tests */
    // webServer: {
    //   command: 'npm run start',
    //   url: 'http://127.0.0.1:3000',
    //   reuseExistingServer: !process.env.CI,
    // },
});
