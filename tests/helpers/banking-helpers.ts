import { Page, expect } from '@playwright/test';

/**
 * Helper functions for banking tests
 * Reduces code duplication and improves maintainability
 */

/**
 * Login with provided credentials
 * @param page - Playwright page object
 * @param username - Username to login with
 * @param password - Password to login with
 */
export async function login(page: Page, username: string, password: string): Promise<void> {
    await page.goto('/');
    await page.fill('#username', username);
    await page.fill('#password', password);
    await page.click('#login-btn');

    // Wait for redirect to dashboard
    await expect(page).toHaveURL(/dashboard.html/);
}

/**
 * Logout from the dashboard
 * @param page - Playwright page object
 */
export async function logout(page: Page): Promise<void> {
    await page.click('#logout-btn');
    await expect(page).toHaveURL(/index.html/);
}

/**
 * Get current balance from the dashboard
 * @param page - Playwright page object
 * @returns Current balance as a number
 */
export async function getCurrentBalance(page: Page): Promise<number> {
    const balanceText = await page.locator('.amount').textContent();
    return parseFloat(balanceText!.replace('$', '').replace(',', ''));
}

/**
 * Perform a deposit operation
 * @param page - Playwright page object
 * @param amount - Amount to deposit
 * @returns True if successful, false otherwise
 */
export async function deposit(page: Page, amount: number): Promise<boolean> {
    await page.fill('#deposit-amount', amount.toString());
    await page.click('#deposit-btn');

    const statusEl = page.locator('#deposit-status');
    const statusText = await statusEl.textContent();

    return statusText?.includes('Deposited') ?? false;
}

/**
 * Perform a debit operation
 * @param page - Playwright page object
 * @param amount - Amount to debit
 * @returns True if successful, false otherwise
 */
export async function debit(page: Page, amount: number): Promise<boolean> {
    await page.fill('#debit-amount', amount.toString());
    await page.click('#debit-btn');

    const statusEl = page.locator('#debit-status');
    const statusText = await statusEl.textContent();

    return statusText?.includes('Debited') ?? false;
}

/**
 * Check balance and get displayed balance
 * @param page - Playwright page object
 * @returns Balance text from the display
 */
export async function checkBalance(page: Page): Promise<string> {
    await page.click('#check-balance-btn');
    await expect(page.locator('#balance-display')).toBeVisible();
    return await page.locator('#balance-display').textContent() ?? '';
}

/**
 * Get error message from deposit status
 * @param page - Playwright page object
 * @returns Error message text
 */
export async function getDepositError(page: Page): Promise<string> {
    return await page.locator('#deposit-status').textContent() ?? '';
}

/**
 * Get error message from debit status
 * @param page - Playwright page object
 * @returns Error message text
 */
export async function getDebitError(page: Page): Promise<string> {
    return await page.locator('#debit-status').textContent() ?? '';
}

/**
 * Get the count of transactions in the list
 * @param page - Playwright page object
 * @returns Number of transactions
 */
export async function getTransactionCount(page: Page): Promise<number> {
    return await page.locator('#transaction-list li').count();
}

/**
 * Get first transaction text
 * @param page - Playwright page object
 * @returns First transaction text content
 */
export async function getFirstTransaction(page: Page): Promise<string> {
    return await page.locator('#transaction-list li').first().textContent() ?? '';
}

/**
 * Clear deposit input field
 * @param page - Playwright page object
 */
export async function clearDepositInput(page: Page): Promise<void> {
    await page.fill('#deposit-amount', '');
}

/**
 * Clear debit input field
 * @param page - Playwright page object
 */
export async function clearDebitInput(page: Page): Promise<void> {
    await page.fill('#debit-amount', '');
}

/**
 * Wait for status message to disappear
 * @param page - Playwright page object
 * @param statusSelector - CSS selector for the status element
 * @param timeout - Timeout in milliseconds
 */
export async function waitForStatusClear(
    page: Page,
    statusSelector: string = '#deposit-status',
    timeout: number = 3000
): Promise<void> {
    await page.waitForTimeout(timeout);
}

/**
 * Verify balance increased by expected amount
 * @param page - Playwright page object
 * @param initialBalance - Initial balance before operation
 * @param expectedIncrease - Expected increase amount
 */
export async function expectBalanceIncreasedBy(
    page: Page,
    initialBalance: number,
    expectedIncrease: number
): Promise<void> {
    const newBalance = await getCurrentBalance(page);
    expect(newBalance).toBeCloseTo(initialBalance + expectedIncrease, 2);
}

/**
 * Verify balance decreased by expected amount
 * @param page - Playwright page object
 * @param initialBalance - Initial balance before operation
 * @param expectedDecrease - Expected decrease amount
 */
export async function expectBalanceDecreasedBy(
    page: Page,
    initialBalance: number,
    expectedDecrease: number
): Promise<void> {
    const newBalance = await getCurrentBalance(page);
    expect(newBalance).toBeCloseTo(initialBalance - expectedDecrease, 2);
}

/**
 * Verify transaction appears in list with specific amount and type
 * @param page - Playwright page object
 * @param description - Transaction description
 * @param amount - Transaction amount (with +/- sign)
 */
export async function expectTransactionExists(
    page: Page,
    description: string,
    amount: string
): Promise<void> {
    const transaction = page.locator('#transaction-list li').filter({ hasText: description });
    await expect(transaction).toContainText(amount);
}

/**
 * Clear status messages after operation
 * @param page - Playwright page object
 */
export async function clearStatusMessages(page: Page): Promise<void> {
    await page.waitForTimeout(500);
    await clearDepositInput(page);
    await clearDebitInput(page);
}
