import { test, expect } from '@playwright/test';
import {
    login,
    logout,
    getCurrentBalance,
    deposit,
    debit,
    checkBalance,
    getDepositError,
    getDebitError,
    getTransactionCount,
    getFirstTransaction,
    clearStatusMessages,
    expectBalanceIncreasedBy,
    expectBalanceDecreasedBy,
    expectTransactionExists,
} from './helpers/banking-helpers';

test.describe('Banking Domain Concept', () => {

    test('Login and verify dashboard', async ({ page }) => {
        // Navigate to the login page
        await page.goto('/');

        // Check title
        await expect(page).toHaveTitle(/NeoBank - Login/);

        // Perform login
        await login(page, 'admin', 'password123');
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
        await login(page, 'admin', 'password123');

        // Logout
        await logout(page);
    });

    test('Deposit operation', async ({ page }) => {
        // Login
        await login(page, 'admin', 'password123');

        // Get initial balance
        const initialBalance = await getCurrentBalance(page);
        console.log(`Initial balance: $${initialBalance}`);

        // Perform deposit
        const depositAmount = 500.00;
        const success = await deposit(page, depositAmount);
        expect(success).toBe(true);

        // Verify balance increased
        await expectBalanceIncreasedBy(page, initialBalance, depositAmount);

        // Verify new transaction appears as first in list (should be the newest)
        const firstTransaction = await getFirstTransaction(page);
        expect(firstTransaction).toContain('Deposit');
        expect(firstTransaction).toContain('+$500.00');
    });

    test('Check balance operation', async ({ page }) => {
        // Login
        await login(page, 'admin', 'password123');

        // Click check balance button
        const balanceText = await checkBalance(page);

        // Verify balance is displayed
        expect(balanceText).toContain('Current Balance:');
        expect(balanceText).toContain('$');
    });

    test('Debit operation with sufficient funds', async ({ page }) => {
        // Login
        await login(page, 'admin', 'password123');

        // Get initial balance
        const initialBalance = await getCurrentBalance(page);
        console.log(`Initial balance: $${initialBalance}`);

        // Perform debit
        const debitAmount = 100.50;
        const success = await debit(page, debitAmount);
        expect(success).toBe(true);

        // Verify balance decreased
        await expectBalanceDecreasedBy(page, initialBalance, debitAmount);

        // Verify new transaction appears in list
        await expectTransactionExists(page, 'Debit', '-$100.50');
    });

    test('Debit operation with insufficient funds', async ({ page }) => {
        // Login
        await login(page, 'admin', 'password123');

        // Attempt to debit a very large amount
        const largeAmount = 999999.99;
        await page.fill('#debit-amount', largeAmount.toString());
        await page.click('#debit-btn');

        // Verify insufficient funds error
        const error = await getDebitError(page);
        expect(error).toContain('Insufficient funds');
    });

    test('Invalid deposit amount', async ({ page }) => {
        // Login
        await login(page, 'admin', 'password123');

        // Attempt deposit with invalid amount (negative)
        await page.fill('#deposit-amount', '-50');
        await page.click('#deposit-btn');

        // Verify error message
        const error = await getDepositError(page);
        expect(error).toContain('Invalid amount');
    });
});
