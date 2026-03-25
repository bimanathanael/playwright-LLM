module.exports = {
    parser: '@typescript-eslint/parser',
    parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
        project: './tsconfig.json',
    },
    plugins: ['@typescript-eslint', 'playwright'],
    extends: [
        'eslint:recommended',
        '@typescript-eslint/recommended',
        'plugin:playwright/recommended',
        'prettier',
    ],
    rules: {
        '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
        '@typescript-eslint/explicit-function-return-type': 'off',
        '@typescript-eslint/explicit-module-boundary-types': 'off',
        '@typescript-eslint/no-explicit-any': 'warn',
        '@typescript-eslint/no-non-null-assertion': 'off',
        'playwright/missing-playwright-await': 'error',
        'playwright/no-networkidle': 'warn',
        'playwright/no-skipped-test': 'warn',
        'playwright/no-useless-await': 'error',
        'playwright/prefer-web-first-assertions': 'error',
        'playwright/prefer-strict-equal': 'error',
        'no-console': 'warn',
        'no-debugger': 'error',
    },
    env: {
        node: true,
        es6: true,
    },
    overrides: [
        {
            files: ['*.spec.ts', '*.test.ts'],
            rules: {
                '@typescript-eslint/no-non-null-assertion': 'off',
                'no-console': 'off',
            },
        },
    ],
};
