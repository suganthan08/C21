import { test, expect } from '@playwright/test';
import {
    login,
    getCurrentBalance,
    deposit,
    debit,
    checkBalance,
    getDepositError,
    getDebitError,
    getTransactionCount,
    getFirstTransaction,
    expectBalanceIncreasedBy,
    expectBalanceDecreasedBy,
    expectTransactionExists,
    clearStatusMessages,
} from './helpers/banking-helpers';

test.describe('Banking Advanced Scenarios', () => {

    test('Multiple sequential deposits increase balance correctly', async ({ page }) => {
        // Login
        await login(page, 'admin', 'password123');

        // Get initial balance
        const initialBalance = await getCurrentBalance(page);

        // Perform multiple deposits
        const deposits = [100.50, 250.75, 75.25];
        let expectedBalance = initialBalance;

        for (const amount of deposits) {
            const success = await deposit(page, amount);
            expect(success).toBe(true);
            expectedBalance += amount;
            await clearStatusMessages(page);
        }

        // Verify final balance
        const finalBalance = await getCurrentBalance(page);
        expect(finalBalance).toBeCloseTo(expectedBalance, 2);

        // Verify all transactions appear (initial 3 + 3 new deposits)
        const transactionCount = await getTransactionCount(page);
        expect(transactionCount).toBe(6);
    });

    test('Multiple sequential debits decrease balance correctly', async ({ page }) => {
        // Login
        await login(page, 'admin', 'password123');

        // Get initial balance
        const initialBalance = await getCurrentBalance(page);

        // Perform multiple debits
        const debits = [100.00, 50.25, 75.50];
        let expectedBalance = initialBalance;

        for (const amount of debits) {
            if (expectedBalance >= amount) {
                const success = await debit(page, amount);
                expect(success).toBe(true);
                expectedBalance -= amount;
                await clearStatusMessages(page);
            }
        }

        // Verify final balance
        const finalBalance = await getCurrentBalance(page);
        expect(finalBalance).toBeCloseTo(expectedBalance, 2);

        // Verify transactions were added
        const transactionCount = await getTransactionCount(page);
        expect(transactionCount).toBeGreaterThan(3);
    });

    test('Debit at exact balance boundary', async ({ page }) => {
        // Login
        await page.goto('/');
        await page.fill('#username', 'admin');
        await page.fill('#password', 'password123');
        await page.click('#login-btn');

        // First reduce balance to a known amount
        const targetBalance = 1000.00;
        const initialText = await page.locator('.amount').textContent();
        const initialBalance = parseFloat(initialText!.replace('$', '').replace(',', ''));
        const amountToDebit = initialBalance - targetBalance;

        if (amountToDebit > 0) {
            await page.fill('#debit-amount', amountToDebit.toString());
            await page.click('#debit-btn');
            await page.waitForTimeout(1000);
        }

        // Now debit the exact remaining balance
        await page.fill('#debit-amount', targetBalance.toString());
        await page.click('#debit-btn');

        // Verify success
        const debitStatus = page.locator('#debit-status');
        await expect(debitStatus).toContainText('Debited');

        // Verify balance is now 0
        const finalText = await page.locator('.amount').textContent();
        const finalBalance = parseFloat(finalText!.replace('$', '').replace(',', ''));
        expect(finalBalance).toBe(0);
    });

    test('Debit more than exact balance fails', async ({ page }) => {
        // Login
        await page.goto('/');
        await page.fill('#username', 'admin');
        await page.fill('#password', 'password123');
        await page.click('#login-btn');

        // Get current balance
        const balanceText = await page.locator('.amount').textContent();
        const balance = parseFloat(balanceText!.replace('$', '').replace(',', ''));

        // Attempt to debit slightly more than balance
        const overAmount = balance + 0.01;
        await page.fill('#debit-amount', overAmount.toString());
        await page.click('#debit-btn');

        // Verify error
        const debitStatus = page.locator('#debit-status');
        await expect(debitStatus).toContainText('Insufficient funds');

        // Verify balance unchanged
        const finalText = await page.locator('.amount').textContent();
        const finalBalance = parseFloat(finalText!.replace('$', '').replace(',', ''));
        expect(finalBalance).toBe(balance);
    });

    test('Decimal precision handling in deposits', async ({ page }) => {
        // Login
        await page.goto('/');
        await page.fill('#username', 'admin');
        await page.fill('#password', 'password123');
        await page.click('#login-btn');

        // Get initial balance
        const initialText = await page.locator('.amount').textContent();
        const initialBalance = parseFloat(initialText!.replace('$', '').replace(',', ''));

        // Deposit with multiple decimal places (should truncate/round properly)
        const preciseAmount = 123.456;
        await page.fill('#deposit-amount', preciseAmount.toString());
        await page.click('#deposit-btn');

        // Verify the amount was added (with 2 decimal precision)
        const finalText = await page.locator('.amount').textContent();
        const finalBalance = parseFloat(finalText!.replace('$', '').replace(',', ''));

        // Should be approximately initialBalance + 123.46 or 123.45 depending on rounding
        const expectedBalance = initialBalance + 123.46;
        expect(finalBalance).toBeCloseTo(expectedBalance, 1);
    });

    test('Balance check reflects current state', async ({ page }) => {
        // Login
        await page.goto('/');
        await page.fill('#username', 'admin');
        await page.fill('#password', 'password123');
        await page.click('#login-btn');

        // Perform a deposit
        await page.fill('#deposit-amount', '500');
        await page.click('#deposit-btn');
        await page.waitForTimeout(500);

        // Get balance from header
        const headerBalance = await page.locator('.amount').textContent();

        // Check balance via button
        await page.click('#check-balance-btn');

        // Verify displayed balance matches header
        const displayedBalance = await page.locator('#balance-display').textContent();
        expect(displayedBalance).toContain(headerBalance!.trim());
    });

    test('Transaction list shows newest first', async ({ page }) => {
        // Login
        await page.goto('/');
        await page.fill('#username', 'admin');
        await page.fill('#password', 'password123');
        await page.click('#login-btn');

        // Perform a deposit (newest)
        await page.fill('#deposit-amount', '999');
        await page.click('#deposit-btn');
        await page.waitForTimeout(500);

        // Check first transaction
        const firstTransaction = page.locator('#transaction-list li').first();
        await expect(firstTransaction).toContainText('Deposit');
        await expect(firstTransaction).toContainText('+$999.00');
    });

    test('Empty input validation for deposit', async ({ page }) => {
        // Login
        await page.goto('/');
        await page.fill('#username', 'admin');
        await page.fill('#password', 'password123');
        await page.click('#login-btn');

        // Leave deposit field empty and click button
        await page.fill('#deposit-amount', '');
        await page.click('#deposit-btn');

        // Verify error
        const depositStatus = page.locator('#deposit-status');
        await expect(depositStatus).toContainText('Invalid amount');
    });

    test('Zero amount deposit validation', async ({ page }) => {
        // Login
        await page.goto('/');
        await page.fill('#username', 'admin');
        await page.fill('#password', 'password123');
        await page.click('#login-btn');

        // Try to deposit zero
        await page.fill('#deposit-amount', '0');
        await page.click('#deposit-btn');

        // Verify error
        const depositStatus = page.locator('#deposit-status');
        await expect(depositStatus).toContainText('Invalid amount');
    });

    test('Zero amount debit validation', async ({ page }) => {
        // Login
        await page.goto('/');
        await page.fill('#username', 'admin');
        await page.fill('#password', 'password123');
        await page.click('#login-btn');

        // Try to debit zero
        await page.fill('#debit-amount', '0');
        await page.click('#debit-btn');

        // Verify error
        const debitStatus = page.locator('#debit-status');
        await expect(debitStatus).toContainText('Invalid amount');
    });

    test('Large amount deposit', async ({ page }) => {
        // Login
        await page.goto('/');
        await page.fill('#username', 'admin');
        await page.fill('#password', 'password123');
        await page.click('#login-btn');

        // Get initial balance
        const initialText = await page.locator('.amount').textContent();
        const initialBalance = parseFloat(initialText!.replace('$', '').replace(',', ''));

        // Deposit large amount
        const largeAmount = 50000.00;
        await page.fill('#deposit-amount', largeAmount.toString());
        await page.click('#deposit-btn');

        // Verify success
        const depositStatus = page.locator('#deposit-status');
        await expect(depositStatus).toContainText('Deposited');

        // Verify balance increased
        const finalText = await page.locator('.amount').textContent();
        const finalBalance = parseFloat(finalText!.replace('$', '').replace(',', ''));
        expect(finalBalance).toBeCloseTo(initialBalance + largeAmount, 2);
    });

    test('Deposit and debit cycle maintains consistency', async ({ page }) => {
        // Login
        await page.goto('/');
        await page.fill('#username', 'admin');
        await page.fill('#password', 'password123');
        await page.click('#login-btn');

        // Get initial balance
        const initialText = await page.locator('.amount').textContent();
        const initialBalance = parseFloat(initialText!.replace('$', '').replace(',', ''));

        // Deposit, then debit same amount
        const testAmount = 750.50;

        await page.fill('#deposit-amount', testAmount.toString());
        await page.click('#deposit-btn');
        await page.waitForTimeout(500);

        await page.fill('#debit-amount', testAmount.toString());
        await page.click('#debit-btn');
        await page.waitForTimeout(500);

        // Balance should return to initial
        const finalText = await page.locator('.amount').textContent();
        const finalBalance = parseFloat(finalText!.replace('$', '').replace(',', ''));
        expect(finalBalance).toBeCloseTo(initialBalance, 2);

        // Verify both transactions appear
        const transactions = page.locator('#transaction-list li');
        const debitTxn = page.locator('#transaction-list li').filter({ hasText: '-$750.50' });
        const depositTxn = page.locator('#transaction-list li').filter({ hasText: '+$750.50' });

        await expect(debitTxn).toHaveCount(1);
        await expect(depositTxn).toHaveCount(1);
    });

});
