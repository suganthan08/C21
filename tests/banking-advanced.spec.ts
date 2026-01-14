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
        await login(page, 'admin', 'password123');

        // First reduce balance to a known amount
        const targetBalance = 1000.00;
        const initialBalance = await getCurrentBalance(page);
        const amountToDebit = initialBalance - targetBalance;

        if (amountToDebit > 0) {
            await debit(page, amountToDebit);
            await clearStatusMessages(page);
        }

        // Now debit the exact remaining balance
        const success = await debit(page, targetBalance);
        expect(success).toBe(true);

        // Verify balance is now 0
        const finalBalance = await getCurrentBalance(page);
        expect(finalBalance).toBe(0);
    });

    test('Debit more than exact balance fails', async ({ page }) => {
        // Login
        await login(page, 'admin', 'password123');

        // Get current balance
        const balance = await getCurrentBalance(page);

        // Attempt to debit slightly more than balance
        const overAmount = balance + 0.01;
        await page.fill('#debit-amount', overAmount.toString());
        await page.click('#debit-btn');

        // Verify error
        const error = await getDebitError(page);
        expect(error).toContain('Insufficient funds');

        // Verify balance unchanged
        const finalBalance = await getCurrentBalance(page);
        expect(finalBalance).toBe(balance);
    });

    test('Decimal precision handling in deposits', async ({ page }) => {
        // Login
        await login(page, 'admin', 'password123');

        // Get initial balance
        const initialBalance = await getCurrentBalance(page);

        // Deposit with multiple decimal places (should truncate/round properly)
        const preciseAmount = 123.456;
        const success = await deposit(page, preciseAmount);
        expect(success).toBe(true);

        // Verify the amount was added (with 2 decimal precision)
        const finalBalance = await getCurrentBalance(page);

        // Should be approximately initialBalance + 123.46 or 123.45 depending on rounding
        const expectedBalance = initialBalance + 123.46;
        expect(finalBalance).toBeCloseTo(expectedBalance, 1);
    });

    test('Balance check reflects current state', async ({ page }) => {
        // Login
        await login(page, 'admin', 'password123');

        // Perform a deposit
        await deposit(page, 500);
        await clearStatusMessages(page);

        // Get balance from header
        const headerBalance = await page.locator('.amount').textContent();

        // Check balance via button
        const displayedBalance = await checkBalance(page);

        // Verify displayed balance matches header
        expect(displayedBalance).toContain(headerBalance!.trim());
    });

    test('Transaction list shows newest first', async ({ page }) => {
        // Login
        await login(page, 'admin', 'password123');

        // Perform a deposit (newest)
        await deposit(page, 999);
        await clearStatusMessages(page);

        // Check first transaction
        const firstTxnText = await getFirstTransaction(page);
        expect(firstTxnText).toContain('Deposit');
        expect(firstTxnText).toContain('+$999.00');
    });

    test('Empty input validation for deposit', async ({ page }) => {
        // Login
        await login(page, 'admin', 'password123');

        // Leave deposit field empty and click button
        await page.fill('#deposit-amount', '');
        await page.click('#deposit-btn');

        // Verify error
        const error = await getDepositError(page);
        expect(error).toContain('Invalid amount');
    });

    test('Zero amount deposit validation', async ({ page }) => {
        // Login
        await login(page, 'admin', 'password123');

        // Try to deposit zero
        await page.fill('#deposit-amount', '0');
        await page.click('#deposit-btn');

        // Verify error
        const error = await getDepositError(page);
        expect(error).toContain('Invalid amount');
    });

    test('Zero amount debit validation', async ({ page }) => {
        // Login
        await login(page, 'admin', 'password123');

        // Try to debit zero
        await page.fill('#debit-amount', '0');
        await page.click('#debit-btn');

        // Verify error
        const error = await getDebitError(page);
        expect(error).toContain('Invalid amount');
    });

    test('Large amount deposit', async ({ page }) => {
        // Login
        await login(page, 'admin', 'password123');

        // Get initial balance
        const initialBalance = await getCurrentBalance(page);

        // Deposit large amount
        const largeAmount = 50000.00;
        const success = await deposit(page, largeAmount);
        expect(success).toBe(true);

        // Verify balance increased
        await expectBalanceIncreasedBy(page, initialBalance, largeAmount);
    });

    test('Deposit and debit cycle maintains consistency', async ({ page }) => {
        // Login
        await login(page, 'admin', 'password123');

        // Get initial balance
        const initialBalance = await getCurrentBalance(page);

        // Deposit, then debit same amount
        const testAmount = 750.50;

        const depositSuccess = await deposit(page, testAmount);
        expect(depositSuccess).toBe(true);
        await clearStatusMessages(page);

        const debitSuccess = await debit(page, testAmount);
        expect(debitSuccess).toBe(true);
        await clearStatusMessages(page);

        // Balance should return to initial
        const finalBalance = await getCurrentBalance(page);
        expect(finalBalance).toBeCloseTo(initialBalance, 2);

        // Verify both transactions appear
        await expectTransactionExists(page, 'Debit', '-$750.50');
        await expectTransactionExists(page, 'Deposit', '+$750.50');
    });

});
