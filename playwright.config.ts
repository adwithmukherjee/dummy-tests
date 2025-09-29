import { defineConfig } from '@playwright/test';
import dotenv from 'dotenv';

dotenv.config();

export default defineConfig({
    testDir: './src',
    testMatch: '**/*.test.ts',
    workers: 1,
    fullyParallel: false,
    retries: 1,
    reporter: [
        ['html', { open: 'never' }],
        ['list']
    ],
    timeout: 60_000,
    use: {
        baseURL: process.env.TARGET_URL || 'https://example.com',
        trace: 'on-first-retry',
        actionTimeout: 10_000,
        headless: true,
        screenshot: 'only-on-failure',
        video: 'retain-on-failure'
    },
    expect: {
        timeout: 15_000
    }
});