import { test, expect } from '@playwright/test';

test.describe('Web Automation Example', () => {
    test.beforeEach(async ({ page }) => {
        // Navigate to base URL before each test
        await page.goto('/');
    });

    test('should load homepage successfully', async ({ page }) => {
        // Example: Check if page loads and has expected title
        await expect(page).toHaveTitle(/Home|Welcome/i);

        // Example: Check if main navigation is visible
        const navigation = page.locator('nav, .navbar, [role="navigation"]');
        await expect(navigation).toBeVisible();
    });

    test('should handle form submission', async ({ page }) => {
        // Example: Fill and submit a form
        const nameInput = page.locator('input[name="name"], #name');
        const emailInput = page.locator('input[name="email"], #email');
        const submitButton = page.locator('button[type="submit"], input[type="submit"]');

        // Only run if form elements exist
        if ((await nameInput.count()) > 0) {
            await nameInput.fill('Test User');
            await emailInput.fill('test@example.com');
            await submitButton.click();

            // Check for success message or redirect
            await expect(page.locator('.success, .alert-success')).toBeVisible({ timeout: 5000 });
        }
    });

});

test.describe('E-commerce Checkout Example', () => {
    test('should handle checkout flow', async ({ page }) => {
        // Example test for generic e-commerce checkout
        test.skip(true, 'Implement based on your actual checkout flow');

        // Navigate to checkout page
        await page.goto('/checkout');

        // Fill shipping information
        await page.fill('[name="firstName"]', 'John');
        await page.fill('[name="lastName"]', 'Doe');
        await page.fill('[name="email"]', 'john.doe@example.com');
        await page.fill('[name="address"]', '123 Test Street');

        // Fill payment information (use your test card numbers)
        await page.fill('[data-testid="card-number"]', '4111111111111111');
        await page.fill('[data-testid="expiry"]', '12/25');
        await page.fill('[data-testid="cvc"]', '123');

        // Submit order
        await page.click('[data-testid="submit-button"]');

        // Wait for order confirmation
        await expect(page.locator('[data-testid="order-confirmation"]')).toBeVisible({
            timeout: 10000,
        });
    });
});
