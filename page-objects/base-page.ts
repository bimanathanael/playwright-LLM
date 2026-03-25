import { Page, Locator, expect } from '@playwright/test';
import { TestUtils } from '../utils/test-utils';

export abstract class BasePage {
    protected page: Page;
    protected utils: TestUtils;
    protected abstract url: string;

    constructor(page: Page) {
        this.page = page;
        this.utils = new TestUtils(page);
    }

    /**
     * Navigate to the page
     */
    async goto(): Promise<void> {
        await this.page.goto(this.url);
        await this.waitForPageLoad();
    }

    /**
     * Wait for page to be fully loaded
     */
    async waitForPageLoad(): Promise<void> {
        await this.page.waitForLoadState('networkidle');
        await this.page.waitForLoadState('domcontentloaded');
    }

    /**
     * Get page title
     */
    async getTitle(): Promise<string> {
        return await this.page.title();
    }

    /**
     * Get current URL
     */
    getCurrentUrl(): string {
        return this.page.url();
    }

    /**
     * Check if page is loaded correctly
     */
    abstract isLoaded(): Promise<boolean>;

    /**
     * Take screenshot of the page
     */
    async takeScreenshot(name?: string): Promise<void> {
        const screenshotName = name || this.constructor.name.toLowerCase();
        await this.utils.takeScreenshot(screenshotName);
    }

    /**
     * Wait for element to be visible
     */
    async waitForElement(selector: string, timeout: number = 10000): Promise<Locator> {
        return await this.utils.waitForElementReady(selector, timeout);
    }

    /**
     * Click element with wait
     */
    async clickElement(selector: string): Promise<void> {
        await this.utils.clickElement(selector);
    }

    /**
     * Fill input field
     */
    async fillField(selector: string, value: string): Promise<void> {
        await this.utils.fillField(selector, value);
    }

    /**
     * Get text content of element
     */
    async getElementText(selector: string): Promise<string> {
        const element = await this.waitForElement(selector);
        return (await element.textContent()) || '';
    }

    /**
     * Check if element is visible
     */
    async isElementVisible(selector: string): Promise<boolean> {
        try {
            const element = this.page.locator(selector);
            await element.waitFor({ state: 'visible', timeout: 5000 });
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Wait for page navigation
     */
    async waitForNavigation(): Promise<void> {
        await this.page.waitForLoadState('networkidle');
    }

    /**
     * Refresh the page
     */
    async refresh(): Promise<void> {
        await this.page.reload();
        await this.waitForPageLoad();
    }

    /**
     * Go back in browser history
     */
    async goBack(): Promise<void> {
        await this.page.goBack();
        await this.waitForPageLoad();
    }

    /**
     * Scroll to element
     */
    async scrollToElement(selector: string): Promise<void> {
        await this.utils.scrollToElement(selector);
    }

    /**
     * Wait for specific text to appear
     */
    async waitForText(text: string, timeout: number = 10000): Promise<void> {
        await this.utils.waitForText(text, timeout);
    }

    /**
     * Handle alerts/confirmations
     */
    async handleAlert(accept: boolean = true): Promise<void> {
        await this.utils.handleDialog(accept);
    }

    /**
     * Get all links on the page
     */
    async getAllLinks(): Promise<string[]> {
        const links = await this.page.locator('a[href]').all();
        const hrefs: string[] = [];

        for (const link of links) {
            const href = await link.getAttribute('href');
            if (href) {
                hrefs.push(href);
            }
        }

        return hrefs;
    }

    /**
     * Validate page elements are present
     */
    async validatePageElements(selectors: string[]): Promise<void> {
        for (const selector of selectors) {
            await expect(this.page.locator(selector)).toBeVisible();
        }
    }
}
