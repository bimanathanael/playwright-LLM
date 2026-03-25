# Playwright Automation Template

Production-ready Playwright automation template for comprehensive Web and API testing with TypeScript

## 🚀 Features

- **Web UI Testing** - Cross-browser testing (Chrome, Firefox, Safari)
- **API Testing** - REST API validation and integration testing
- **Page Object Model** - Organized and maintainable test structure
- **TypeScript Support** - Full type safety and IntelliSense
- **Multiple Environments** - Staging, UAT, Production configurations
- **Built-in Utilities** - API helpers, test utilities, and common functions

## Prerequisites

- Node.js (version 16 or higher)
- npm or yarn

## 🛠️ Installation

### Quick Start

```bash
# Clone the repository
git clone <repository-url>
cd base-playwright-automation

# Install dependencies
npm install

# Install browsers
npx playwright install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration
```

### For Web Automation

```bash
# Initialize new Playwright project with web testing setup
npm init playwright@latest

# Or install in existing project
npm install -D @playwright/test

# Install browsers (Chromium, Firefox, WebKit)
npx playwright install
```

### For API Testing

```bash
# Install Playwright Test (same as web automation)
npm install -D @playwright/test

# For API testing, you don't need browsers, but if you want them:
npx playwright install

# Or install only Playwright core for API-only testing
npm install -D playwright-core
```

### Additional Setup

```bash
# Install TypeScript (recommended)
npm install -D typescript

# Install additional types if needed
npm install -D @types/node
```

## 🏃‍♂️ Running Tests

```bash
# Run all tests
npm test

# Run web tests only
npm run test:web

# Run API tests only
npm run test:api

# Run with UI mode
npm run test:ui

# Run in debug mode
npm run test:debug

# Run on specific environment
npm run test:staging
npm run test:uat
```

## 📁 Project Structure

```
├── config/
│   └── environment.ts      # Environment configurations
├── page-objects/
│   ├── base-page.ts       # Base page object class
│   └── home-page.ts       # Example page object
├── tests/
│   ├── api/
│   │   └── example-api.spec.ts    # API test examples
│   └── web/
│       └── example-web.spec.ts    # Web test examples
├── utils/
│   ├── api-helper.ts      # API testing utilities
│   └── test-utils.ts      # Common test utilities
├── docs/
│   └── getting-started.md # Detailed documentation
├── playwright.config.ts   # Playwright configuration
├── package.json
├── tsconfig.json
└── .env.example           # Environment variables template
```

## 📖 Usage Examples

### Web Testing

```typescript
import { test, expect } from '@playwright/test';
import { HomePage } from '../page-objects/home-page';

test('homepage loads correctly', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.goto();
    await expect(await homePage.isLoaded()).toBe(true);
});
```

### API Testing

```typescript
import { test, expect } from '@playwright/test';
import { ApiHelper } from '../utils/api-helper';

test('API health check', async ({ request }) => {
    const apiHelper = new ApiHelper(request, 'your-api-key');
    const response = await apiHelper.get('/health');
    expect(response.status()).toBe(200);
});
```

## 🔧 Configuration

### Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
TEST_ENV=staging
API_SECRET_KEY=your-secret-api-key
```

### Browser Configuration

Tests run on multiple browsers by default:

- Chromium (Chrome/Edge)
- Firefox
- WebKit (Safari)

## 📊 Reporting

View test reports after execution:

```bash
npm run report
```

Reports include:

- HTML report with test results
- Screenshots on failures
- Video recordings (if enabled)
- Trace files for debugging

## 🔍 Debugging

```bash
# Visual debugging with browser
npm run test:headed

# Step-through debugging
npm run test:debug

# Generate test code
npm run codegen
```

## 🤝 Contributing

1. Follow the existing code structure
2. Add tests for new features
3. Update documentation as needed
4. Run linting before committing:
    ```bash
    npm run lint
    npm run format:check
    ```

## 📋 Available Scripts

### Verify Installation

```bash
# Run sample tests
npx playwright test

# Generate code for web automation
npx playwright codegen

# Show installed browsers
npx playwright --version
```

## 🆘 Support

- Check the [Getting Started Guide](./docs/getting-started.md)
- Review example test files

## 📄 License

MIT License - see LICENSE file for details
