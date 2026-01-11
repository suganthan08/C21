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

    // Verify account number is shown and has expected format
    const acct = page.locator('#account-number');
    await expect(acct).toBeVisible();
    // Expect format ACCT- followed by 8 digits
    await expect(acct).toHaveText(/ACCT-\d{8}/);

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

    test('Deposit operation', async ({ page }) => {
        // Login
        await page.goto('/');
        await page.fill('#username', 'admin');
        await page.fill('#password', 'password123');
        await page.click('#login-btn');

        // Get initial balance
        const initialBalance = await page.locator('.amount').textContent();
        console.log(`Initial balance: ${initialBalance}`);

        // Perform deposit
        const depositAmount = '500.00';
        await page.fill('#deposit-amount', depositAmount);
        await page.click('#deposit-btn');

        // Verify deposit status message
        await expect(page.locator('#deposit-status')).toContainText('Deposited');

        // Verify balance increased
        const balanceAfterDeposit = await page.locator('.amount').textContent();
        expect(balanceAfterDeposit).not.toEqual(initialBalance);
        console.log(`Balance after deposit: ${balanceAfterDeposit}`);

        // Verify new transaction appears in list
        const firstTransaction = page.locator('#transaction-list li').first();
        await expect(firstTransaction).toContainText('Deposit');
        await expect(firstTransaction).toContainText('+$500.00');
    });

    test('Check balance operation', async ({ page }) => {
        // Login
        await page.goto('/');
        await page.fill('#username', 'admin');
        await page.fill('#password', 'password123');
        await page.click('#login-btn');

        // Click check balance button
        await page.click('#check-balance-btn');

        // Verify balance is displayed
        const balanceDisplay = page.locator('#balance-display');
        await expect(balanceDisplay).toBeVisible();
        await expect(balanceDisplay).toContainText('Current Balance:');
        await expect(balanceDisplay).toContainText('$');
    });

    test('Debit operation with sufficient funds', async ({ page }) => {
        // Login
        await page.goto('/');
        await page.fill('#username', 'admin');
        await page.fill('#password', 'password123');
        await page.click('#login-btn');

        // Get initial balance
        const initialBalance = await page.locator('.amount').textContent();
        console.log(`Initial balance: ${initialBalance}`);

        // Perform debit
        const debitAmount = '100.50';
        await page.fill('#debit-amount', debitAmount);
        await page.click('#debit-btn');

        // Verify debit status message
        await expect(page.locator('#debit-status')).toContainText('Debited');

        // Verify balance decreased
        const balanceAfterDebit = await page.locator('.amount').textContent();
        expect(balanceAfterDebit).not.toEqual(initialBalance);
        console.log(`Balance after debit: ${balanceAfterDebit}`);

        // Verify new transaction appears in list
        const firstTransaction = page.locator('#transaction-list li').first();
        await expect(firstTransaction).toContainText('Debit');
        await expect(firstTransaction).toContainText('-$100.50');
    });

    test('Debit operation with insufficient funds', async ({ page }) => {
        // Login
        await page.goto('/');
        await page.fill('#username', 'admin');
        await page.fill('#password', 'password123');
        await page.click('#login-btn');

        // Attempt to debit a very large amount
        const largeAmount = '999999.99';
        await page.fill('#debit-amount', largeAmount);
        await page.click('#debit-btn');

        // Verify insufficient funds error
        await expect(page.locator('#debit-status')).toContainText('Insufficient funds');
    });

    test('Invalid deposit amount', async ({ page }) => {
        // Login
        await page.goto('/');
        await page.fill('#username', 'admin');
        await page.fill('#password', 'password123');
        await page.click('#login-btn');

        // Attempt deposit with invalid amount (empty or negative)
        await page.fill('#deposit-amount', '-50');
        await page.click('#deposit-btn');

        // Verify error message
        await expect(page.locator('#deposit-status')).toContainText('Invalid amount');
    });
});
