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
    // Find the first transaction with the exact description to avoid strict mode issues
    const transactions = page.locator('#transaction-list li');
    const count = await transactions.count();
    
    for (let i = 0; i < count; i++) {
        const text = await transactions.nth(i).textContent();
        if (text?.includes(description) && text?.includes(amount)) {
            // Found the transaction, pass the test
            return;
        }
    }
    
    // If we get here, transaction not found
    throw new Error(`Transaction with '${description}' and '${amount}' not found`);
}

/**
 * Clear status messages after operation
 * @param page - Playwright page object
 */
export async function clearBeneficiaryInput(page: Page): Promise<void> {
    await page.fill('#beneficiary-name', '');
    await page.fill('#beneficiary-account', '');
    await page.fill('#beneficiary-bank', '');
}

/**
 * CREATE - Add a new beneficiary
 * @param page - Playwright page object
 * @param name - Beneficiary name
 * @param account - Beneficiary account number
 * @param bank - Beneficiary bank name
 * @returns True if successful, false otherwise
 */
export async function createBeneficiary(
    page: Page,
    name: string,
    account: string,
    bank: string
): Promise<boolean> {
    await page.fill('#beneficiary-name', name);
    await page.fill('#beneficiary-account', account);
    await page.fill('#beneficiary-bank', bank);
    await page.click('#add-beneficiary-btn');

    const statusEl = page.locator('#beneficiary-status');
    const statusText = await statusEl.textContent();

    return statusText?.includes('added successfully') ?? false;
}

/**
 * READ - Get all beneficiaries from the list
 * @param page - Playwright page object
 * @returns Array of beneficiary info strings
 */
export async function readBeneficiaries(page: Page): Promise<string[]> {
    const beneficiaryElements = page.locator('#beneficiary-list li');
    const count = await beneficiaryElements.count();
    const beneficiaries: string[] = [];

    for (let i = 0; i < count; i++) {
        const text = await beneficiaryElements.nth(i).locator('.beneficiary-info').textContent();
        if (text) {
            beneficiaries.push(text);
        }
    }

    return beneficiaries;
}

/**
 * READ - Get beneficiary count
 * @param page - Playwright page object
 * @returns Number of beneficiaries in the list
 */
export async function getBeneficiaryCount(page: Page): Promise<number> {
    return await page.locator('#beneficiary-list li').count();
}

/**
 * UPDATE - Edit a beneficiary
 * @param page - Playwright page object
 * @param beneficiaryId - ID of the beneficiary to edit
 * @param newName - New name (set to existing name if not changing)
 * @param newAccount - New account number (set to existing if not changing)
 * @param newBank - New bank name (set to existing if not changing)
 * @returns True if successful, false otherwise
 */
export async function updateBeneficiary(
    page: Page,
    beneficiaryId: number,
    newName: string,
    newAccount: string,
    newBank: string
): Promise<boolean> {
    // Handle prompts - user needs to set up page.on('dialog') for this to work
    let promptCount = 0;
    page.on('dialog', async (dialog) => {
        if (promptCount === 0) {
            await dialog.accept(newName);
        } else if (promptCount === 1) {
            await dialog.accept(newAccount);
        } else if (promptCount === 2) {
            await dialog.accept(newBank);
        }
        promptCount++;
    });

    await page.click(`.edit-btn[data-id="${beneficiaryId}"]`);
    await page.waitForTimeout(500); // Wait for dialogs to process

    const statusEl = page.locator('#beneficiary-status');
    const statusText = await statusEl.textContent();

    return statusText?.includes('updated successfully') ?? false;
}

/**
 * DELETE - Remove a beneficiary
 * @param page - Playwright page object
 * @param beneficiaryId - ID of the beneficiary to delete
 * @returns True if successful, false otherwise
 */
export async function deleteBeneficiary(page: Page, beneficiaryId: number): Promise<boolean> {
    // Setup dialog handler for confirmation
    page.on('dialog', async (dialog) => {
        await dialog.accept(); // Click OK on confirmation
    });

    await page.click(`.delete-btn[data-id="${beneficiaryId}"]`);
    await page.waitForTimeout(500); // Wait for dialog to process

    const statusEl = page.locator('#beneficiary-status');
    const statusText = await statusEl.textContent();

    return statusText?.includes('deleted successfully') ?? false;
}

/**
 * Verify beneficiary exists in the list
 * @param page - Playwright page object
 * @param name - Beneficiary name to search for
 * @returns True if beneficiary found, false otherwise
 */
export async function beneficiaryExists(page: Page, name: string): Promise<boolean> {
    const beneficiaryElement = page.locator('#beneficiary-list li').filter({ hasText: name });
    const count = await beneficiaryElement.count();
    return count > 0;
}

/**
 * Get beneficiary error/status message
 * @param page - Playwright page object
 * @returns Status message text
 */
export async function getBeneficiaryStatus(page: Page): Promise<string> {
    return await page.locator('#beneficiary-status').textContent() ?? '';
}

export async function clearStatusMessages(page: Page): Promise<void> {
    await page.waitForTimeout(500);
    await clearDepositInput(page);
    await clearDebitInput(page);
}
