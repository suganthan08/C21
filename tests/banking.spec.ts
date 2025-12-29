import { test, expect } from '@playwright/test';

test.describe('Banking Domain Concept', () => {

    test('Login and verify dashboard', async ({ page }) => {
        // Navigate to the login page
        await page.goto('/');

        // Check title
        await expect(page).toHaveTitle(/NeoBank - Login/);

        // Perform login
        await page.fill('#username', 'admin');
        await page.fill('#password', 'password123');
        await page.click('#login-btn');

        // Verify redirection to dashboard
        await expect(page).toHaveURL(/dashboard.html/);
        await expect(page.locator('h2')).toContainText('Welcome, Admin');

        // Check balance visibility
        await expect(page.locator('.balance-card')).toBeVisible();
        await expect(page.locator('.amount')).toContainText('$25,430.00');

        // Check transactions
        const transactions = page.locator('#transaction-list li');
        await expect(transactions).toHaveCount(3);
    });

    test('Invalid login shows error', async ({ page }) => {
        await page.goto('/');

        await page.fill('#username', 'wrong');
        await page.fill('#password', 'wrong');
        await page.click('#login-btn');

        await expect(page.locator('#error-msg')).toBeVisible();
        await expect(page.locator('#error-msg')).toContainText('Invalid credentials');
    });

    test('Logout flow', async ({ page }) => {
        // Login first
        await page.goto('/');
        await page.fill('#username', 'admin');
        await page.fill('#password', 'password123');
        await page.click('#login-btn');

        // Logout
        await page.click('#logout-btn');

        // Verify back to login
        await expect(page).toHaveURL(/index.html/);
        await expect(page.locator('#login-form')).toBeVisible();
    });
});
