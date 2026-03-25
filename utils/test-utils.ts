import { Page, Locator, expect } from '@playwright/test';

export class TestUtils {
    private page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    /**
     * Wait for page to be fully loaded
     */
    async waitForPageLoad(): Promise<void> {
        await this.page.waitForLoadState('networkidle');
        await this.page.waitForLoadState('domcontentloaded');
    }

    /**
     * Take screenshot with timestamp
     */
    async takeScreenshot(name: string): Promise<void> {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        await this.page.screenshot({
            path: `screenshots/${name}-${timestamp}.png`,
            fullPage: true,
        });
    }

    /**
     * Fill form field with retry mechanism
     */
    async fillField(
        selector: string,
        value: string,
        options?: { timeout?: number }
    ): Promise<void> {
        const element = this.page.locator(selector);
        await element.waitFor({ state: 'visible', timeout: options?.timeout });
        await element.clear();
        await element.fill(value);

        // Verify the value was filled
        await expect(element).toHaveValue(value);
    }

    /**
     * Click element with retry mechanism
     */
    async clickElement(selector: string, options?: { timeout?: number }): Promise<void> {
        const element = this.page.locator(selector);
        await element.waitFor({ state: 'visible', timeout: options?.timeout });
        await element.click();
    }

    /**
     * Wait for element to be visible and enabled
     */
    async waitForElementReady(selector: string, timeout: number = 10000): Promise<Locator> {
        const element = this.page.locator(selector);
        await element.waitFor({ state: 'visible', timeout });
        await element.waitFor({ state: 'attached', timeout });
        return element;
    }

    /**
     * Scroll element into view
     */
    async scrollToElement(selector: string): Promise<void> {
        await this.page.locator(selector).scrollIntoViewIfNeeded();
    }

    /**
     * Wait for text to appear on page
     */
    async waitForText(text: string, timeout: number = 10000): Promise<void> {
        await this.page.waitForSelector(`text=${text}`, { timeout });
    }

    /**
     * Check if element exists without throwing
     */
    async elementExists(selector: string): Promise<boolean> {
        try {
            const element = this.page.locator(selector);
            return (await element.count()) > 0;
        } catch {
            return false;
        }
    }

    /**
     * Handle browser alerts/dialogs
     */
    async handleDialog(accept: boolean = true, promptText?: string): Promise<void> {
        this.page.on('dialog', async dialog => {
            if (promptText && dialog.type() === 'prompt') {
                await dialog.accept(promptText);
            } else if (accept) {
                await dialog.accept();
            } else {
                await dialog.dismiss();
            }
        });
    }

    /**
     * Generate random test data
     */
    generateTestData() {
        const timestamp = Date.now();
        return {
            email: `test${timestamp}@example.com`,
            firstName: `FirstName${timestamp}`,
            lastName: `LastName${timestamp}`,
            phone: `+639${Math.floor(Math.random() * 1000000000)}`,
            randomString: Math.random().toString(36).substring(7),
            randomNumber: Math.floor(Math.random() * 1000),
        };
    }

    /**
     * Fill payment card form with test data
     * Use your own test card numbers based on your payment provider
     */
    async fillPaymentForm(
        cardNumber: string = '4111111111111111',
        expiry: string = '12/25',
        cvc: string = '123',
        cardholderName: string = 'Test User'
    ): Promise<void> {
        // Try common payment form selectors
        await this.fillField(
            '[data-testid="card-number"], input[name="cardNumber"], #cardNumber',
            cardNumber
        );
        await this.fillField('[data-testid="expiry"], input[name="expiry"], #expiry', expiry);
        await this.fillField('[data-testid="cvc"], input[name="cvc"], #cvc', cvc);
        await this.fillField(
            '[data-testid="cardholder-name"], input[name="cardholderName"], #cardholderName',
            cardholderName
        );
    }

    /**
     * Wait for API response
     */
    async waitForApiResponse(urlPattern: string | RegExp, timeout: number = 30000): Promise<any> {
        const response = await this.page.waitForResponse(
            response => {
                const url = response.url();
                if (typeof urlPattern === 'string') {
                    return url.includes(urlPattern);
                }
                return urlPattern.test(url);
            },
            { timeout }
        );

        return await response.json();
    }

    /**
     * Mock API response
     */
    async mockApiResponse(
        urlPattern: string | RegExp,
        mockResponse: any,
        status: number = 200
    ): Promise<void> {
        await this.page.route(urlPattern, async route => {
            await route.fulfill({
                status,
                contentType: 'application/json',
                body: JSON.stringify(mockResponse),
            });
        });
    }
}
