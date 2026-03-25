import { APIRequestContext, expect } from '@playwright/test';

export class ApiHelper {
    private request: APIRequestContext;
    private basicAuthCredentials?: string;

    constructor(request: APIRequestContext, key?: string) {
        this.request = request;
        if (key) {
            this.basicAuthCredentials = this.encodeBasicAuth(key);
        }
    }

    /**
     * Set basic authentication credentials using API key
     */
    setBasicAuth(key: string): void {
        this.basicAuthCredentials = this.encodeBasicAuth(key);
    }

    /**
     * Encode API key for basic authentication
     */
    private encodeBasicAuth(key: string): string {
        // For API key authentication, typically key is used with empty password
        const credentials = `${key}:`;
        return Buffer.from(credentials).toString('base64');
    }

    /**
     * Get default headers with basic authentication
     */
    private getHeaders(): Record<string, string> {
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            Accept: 'application/json',
        };

        if (this.basicAuthCredentials) {
            headers['Authorization'] = `Basic ${this.basicAuthCredentials}`;
        }

        return headers;
    }

    /**
     * Make authenticated GET request
     */
    async get(endpoint: string, options?: { headers?: Record<string, string> }) {
        return await this.request.get(endpoint, {
            headers: { ...this.getHeaders(), ...options?.headers },
        });
    }

    /**
     * Make authenticated POST request
     */
    async post(endpoint: string, data: any, options?: { headers?: Record<string, string> }) {
        return await this.request.post(endpoint, {
            data,
            headers: { ...this.getHeaders(), ...options?.headers },
        });
    }

    /**
     * Make authenticated PUT request
     */
    async put(endpoint: string, data: any, options?: { headers?: Record<string, string> }) {
        return await this.request.put(endpoint, {
            data,
            headers: { ...this.getHeaders(), ...options?.headers },
        });
    }

    /**
     * Make authenticated DELETE request
     */
    async delete(endpoint: string, options?: { headers?: Record<string, string> }) {
        return await this.request.delete(endpoint, {
            headers: { ...this.getHeaders(), ...options?.headers },
        });
    }

    /**
     * Validate response status and return JSON body
     */
    async validateAndGetJson(response: any, expectedStatus: number = 200) {
        expect(response.status()).toBe(expectedStatus);
        return await response.json();
    }

    /**
     * Wait for a condition with timeout
     */
    async waitForCondition(
        checkFunction: () => Promise<boolean>,
        timeoutMs: number = 30000,
        intervalMs: number = 1000
    ): Promise<void> {
        const startTime = Date.now();

        while (Date.now() - startTime < timeoutMs) {
            if (await checkFunction()) {
                return;
            }
            await new Promise(resolve => setTimeout(resolve, intervalMs));
        }

        throw new Error(`Condition not met within ${timeoutMs}ms`);
    }
}
