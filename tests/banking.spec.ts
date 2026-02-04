import { test, expect } from '@playwright/test';
import { BankingPage } from './pages/banking.page';

test.describe('Banking Domain Concept', () => {

    test('Login and verify dashboard', async ({ page }) => {
        const bankingPage = new BankingPage(page);

        // Action: Login
        await bankingPage.login('admin', 'password123');

        // Assertions only
        await expect(page).toHaveTitle(/NeoBank - Dashboard/);
        await expect(page.locator('h2')).toContainText('Welcome, Admin');
        expect(await bankingPage.isBalanceCardVisible()).toBeTruthy();
        expect(await bankingPage.getBalanceDisplayText()).toContain('$25,430.00');
        expect(await bankingPage.getAccountNumber()).toMatch(/ACCT-\d{8}/);
        expect(await bankingPage.getTransactionCount()).toBe(3);
    });

    test('Invalid login shows error', async ({ page }) => {
        const bankingPage = new BankingPage(page);

        // Action: Navigate and attempt invalid login
        await bankingPage.navigateToLogin();
        await bankingPage.getPage().fill('#username', 'wrong');
        await bankingPage.getPage().fill('#password', 'wrong');
        await bankingPage.getPage().click('#login-btn');

        // Assertions only
        expect(await bankingPage.isErrorMessageVisible()).toBeTruthy();
        expect(await bankingPage.getErrorMessage()).toContain('Invalid credentials');
    });

    test('Logout flow', async ({ page }) => {
        const bankingPage = new BankingPage(page);

        // Action: Login then logout
        await bankingPage.login('admin', 'password123');
        await bankingPage.logout();

        // Assertions only
        expect(await bankingPage.getCurrentURL()).toContain('index.html');
        expect(await bankingPage.isLoginFormVisible()).toBeTruthy();
    });

    test('Deposit operation', async ({ page }) => {
        const bankingPage = new BankingPage(page);

        // Setup
        await bankingPage.login('admin', 'password123');
        const initialBalance = await bankingPage.getCurrentBalance();

        // Action: Perform deposit
        const depositAmount = 500;
        await bankingPage.performDeposit(depositAmount);

        // Assertions only
        expect(await bankingPage.getDepositStatus()).toContain('Deposited');
        const newBalance = await bankingPage.getCurrentBalance();
        expect(newBalance).toBeGreaterThan(initialBalance);
        expect(await bankingPage.transactionExists('Deposit', `+$${depositAmount.toFixed(2)}`)).toBeTruthy();
    });

    test('Check balance operation', async ({ page }) => {
        const bankingPage = new BankingPage(page);

        // Setup
        await bankingPage.login('admin', 'password123');

        // Action: Check balance
        await bankingPage.checkBalance();

        // Assertions only
        const balanceDisplay = await bankingPage.getBalanceCheckDisplay();
        expect(balanceDisplay).toContain('Current Balance:');
        expect(balanceDisplay).toContain('$');
    });

    test('Debit operation with sufficient funds', async ({ page }) => {
        const bankingPage = new BankingPage(page);

        // Setup
        await bankingPage.login('admin', 'password123');
        const initialBalance = await bankingPage.getCurrentBalance();

        // Action: Perform debit
        const debitAmount = 100.50;
        await bankingPage.performDebit(debitAmount);

        // Assertions only
        expect(await bankingPage.getDebitStatus()).toContain('Debited');
        const newBalance = await bankingPage.getCurrentBalance();
        expect(newBalance).toBeLessThan(initialBalance);
        expect(await bankingPage.transactionExists('Debit', `-$${debitAmount.toFixed(2)}`)).toBeTruthy();
    });

    test('Debit operation with insufficient funds', async ({ page }) => {
        const bankingPage = new BankingPage(page);

        // Setup
        await bankingPage.login('admin', 'password123');

        // Action: Attempt debit with large amount
        await bankingPage.performDebit(999999.99);

        // Assertions only
        expect(await bankingPage.getDebitStatus()).toContain('Insufficient funds');
    });

    test('Invalid deposit amount', async ({ page }) => {
        const bankingPage = new BankingPage(page);

        // Setup
        await bankingPage.login('admin', 'password123');

        // Action: Attempt deposit with negative amount
        await bankingPage.getPage().fill('#deposit-amount', '-50');
        await bankingPage.getPage().click('#deposit-btn');

        // Assertions only
        expect(await bankingPage.getDepositStatus()).toContain('Invalid amount');
    });
});
