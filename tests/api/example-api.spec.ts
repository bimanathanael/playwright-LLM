import { test, expect } from '@playwright/test';
import { ApiHelper } from '../../utils/api-helper';

test.describe('API Testing Example', () => {
    let apiHelper: ApiHelper;

    test.beforeAll(async ({ request }) => {
        // Initialize API helper with API key authentication
        // You can set API key here or use environment variables
        apiHelper = new ApiHelper(request, process.env.API_SECRET_KEY);
        // Or set it later:
        // apiHelper.setBasicAuth(process.env.API_SECRET_KEY!);
    });

    test('should get health check endpoint', async ({ request }) => {
        const response = await request.get('/health');

        expect(response.status()).toBe(200);

        const responseBody = await response.json();
        expect(responseBody).toHaveProperty('status');
        expect(responseBody.status).toBe('ok');
    });

    test('should create and retrieve resource', async ({ request }) => {
        // Example: Create a resource using API helper with basic auth
        const createResponse = await apiHelper.post('/api/resources', {
            name: 'Test Resource',
            description: 'This is a test resource',
        });

        expect(createResponse.status()).toBe(201);

        const createdResource = await createResponse.json();
        expect(createdResource).toHaveProperty('id');

        // Retrieve the created resource
        const getResponse = await apiHelper.get(`/api/resources/${createdResource.id}`);

        expect(getResponse.status()).toBe(200);

        const retrievedResource = await getResponse.json();
        expect(retrievedResource.name).toBe('Test Resource');
    });

    test('should handle POST request with body', async ({ request }) => {
        // Example: Generic POST request
        test.skip(true, 'Implement based on your actual API endpoints');

        const createResponse = await apiHelper.post('/api/items', {
            name: 'Test Item',
            description: 'A sample item for testing',
            price: 100.00
        });

        expect(createResponse.status()).toBe(201);

        const responseData = await createResponse.json();
        expect(responseData).toHaveProperty('id');
        expect(responseData.name).toBe('Test Item');
    });

    test('should handle error responses', async ({ request }) => {
        // Test error handling
        const response = await request.get('/api/nonexistent-endpoint');

        expect(response.status()).toBe(404);

        const errorResponse = await response.json();
        expect(errorResponse).toHaveProperty('error');
    });

    test('should validate response schema', async ({ request }) => {
        const response = await apiHelper.get('/api/resources');

        expect(response.status()).toBe(200);

        const responseBody = await response.json();

        // Validate response structure
        expect(responseBody).toHaveProperty('data');
        expect(Array.isArray(responseBody.data)).toBe(true);

        if (responseBody.data.length > 0) {
            const firstItem = responseBody.data[0];
            expect(firstItem).toHaveProperty('id');
            expect(firstItem).toHaveProperty('attributes');
        }
    });
});
