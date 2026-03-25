# Getting Started with Playwright Automation

This guide will help you get started with the Playwright automation framework for both web and API testing.

## Quick Setup

1. **Clone and Install**

    ```bash
    git clone <repository-url>
    cd playwright-automation-template
    npm install
    ```

2. **Install Browsers**

    ```bash
    npx playwright install
    ```

3. **Set up Environment**
    ```bash
    cp .env.example .env
    # Edit .env with your test configuration
    ```

## Running Tests

### All Tests (Chromium + API)

```bash
npm test
```

### Web Tests Only (Chromium)

```bash
npm run test:web
```

### API Tests Only

```bash
npm run test:api
```

### With UI Mode

```bash
npm run test:ui
```

### Debug Mode

```bash
npm run test:debug
```

## Project Structure

```
├── config/           # Environment configuration
├── page-objects/     # Page Object Model classes
├── tests/
│   ├── api/         # API test specifications
│   └── web/         # Web UI test specifications
├── utils/           # Helper utilities and common functions
└── docs/           # Documentation
```

## Writing Tests

### Web Tests

Create test files in `tests/web/` directory:

```typescript
import { test, expect } from '@playwright/test';

test('example web test', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Expected Title/);
});
```

### API Tests

Create test files in `tests/api/` directory:

```typescript
import { test, expect } from '@playwright/test';

test('example API test', async ({ request }) => {
    const response = await request.get('/api/endpoint');
    expect(response.status()).toBe(200);
});
```

### Using Page Objects

```typescript
import { HomePage } from '../page-objects/home-page';

test('using page objects', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.goto();
    await expect(await homePage.isLoaded()).toBe(true);
});
```

## Best Practices

1. **Use Page Object Model** - Keep page interactions in dedicated classes
2. **Use data-testid attributes** - For reliable element selection
3. **Wait for elements** - Use Playwright's auto-waiting features
4. **Isolate tests** - Each test should be independent
5. **Use environment variables** - For different test environments

## Configuration

### Environment Switching

```bash
# Run tests against staging
npm run test:staging

# Run tests against UAT
npm run test:uat
```

### Browser Configuration

Tests run on **Chromium (Chrome) by default** for faster execution.

**Default browser:**
- Chromium (Chrome/Edge)

**Additional browsers available** (uncomment in `playwright.config.ts` when needed):
- Firefox
- WebKit (Safari)

**Enable cross-browser testing:**
```bash
# Edit playwright.config.ts and uncomment desired browser projects
# Then run tests to include all browsers
npm test
```

**Run specific browser:**
```bash
npx playwright test --project=chromium     # Default browser
npx playwright test --project=firefox      # If enabled
npx playwright test --project=webkit       # If enabled
```

## Reporting

After test execution, view reports:

```bash
npm run report
```

Reports include:

- Test results with screenshots/videos on failures
- Trace viewer for debugging
- Performance metrics

## Debugging

1. **Visual Debugging**

    ```bash
    npm run test:debug
    ```

2. **Headed Mode**

    ```bash
    npm run test:headed
    ```

3. **Codegen for UI Tests**
    ```bash
    npm run codegen
    ```

## Support

For questions or issues:

1. Check existing documentation
2. Review example test files
3. Consult [Playwright Documentation](https://playwright.dev)
4. Open an issue in the repository
