/**
 * Environment Configuration
 * Configure different environments for your tests
 */

type Environment = 'staging' | 'uat' | 'production';

interface EnvironmentConfig {
    baseUrl: string;
    apiUrl: string;
    timeout: number;
}

const environments: Record<Environment, EnvironmentConfig> = {
    staging: {
        baseUrl: process.env.STAGING_BASE_URL || 'https://staging.example.com',
        apiUrl: process.env.STAGING_API_URL || 'https://api-staging.example.com',
        timeout: 30000,
    },
    uat: {
        baseUrl: process.env.UAT_BASE_URL || 'https://uat.example.com',
        apiUrl: process.env.UAT_API_URL || 'https://api-uat.example.com',
        timeout: 30000,
    },
    production: {
        baseUrl: process.env.PROD_BASE_URL || 'https://example.com',
        apiUrl: process.env.PROD_API_URL || 'https://api.example.com',
        timeout: 60000,
    },
};

// Get current environment from env variable or default to staging
const currentEnv = (process.env.TEST_ENV as Environment) || 'staging';

export const environment = {
    ...environments[currentEnv],
    env: currentEnv,
    
    // Test user credentials (use environment variables for sensitive data)
    testUser: {
        username: process.env.TEST_USERNAME || 'test@example.com',
        password: process.env.TEST_PASSWORD || '', // Never hardcode passwords
    },
    
    // API authentication
    apiKey: process.env.API_SECRET_KEY || '',
    
    // Feature flags
    features: {
        enableScreenshots: process.env.TAKE_SCREENSHOTS === 'true',
        enableVideoRecording: process.env.RECORD_VIDEOS === 'true',
        enableTracing: process.env.ENABLE_TRACING === 'true',
    },
};

export default environment;
