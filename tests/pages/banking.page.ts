import { Page, expect } from '@playwright/test';

/**
 * Banking Page Object Model (POM)
 * Encapsulates all interactions with the banking application
 * Spec files should only contain assertions, not interactions
 */
export class BankingPage {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  // ==================== AUTHENTICATION ====================

  /**
   * Navigate to login page and perform login
   */
  async login(username: string, password: string): Promise<void> {
    await this.page.goto('/');
    await this.page.fill('#username', username);
    await this.page.fill('#password', password);
    await this.page.click('#login-btn');
    await expect(this.page).toHaveURL(/dashboard.html/);
  }

  /**
   * Perform logout
   */
  async logout(): Promise<void> {
    await this.page.click('#logout-btn');
    await expect(this.page).toHaveURL(/index.html/);
  }

  /**
   * Navigate to login page without login
   */
  async navigateToLogin(): Promise<void> {
    await this.page.goto('/');
  }

  // ==================== BALANCE OPERATIONS ====================

  /**
   * Get current balance as a number
   */
  async getCurrentBalance(): Promise<number> {
    const balanceText = await this.page.locator('.amount').textContent();
    return parseFloat(balanceText!.replace('$', '').replace(',', ''));
  }

  /**
   * Get balance display text
   */
  async getBalanceDisplayText(): Promise<string> {
    return await this.page.locator('.amount').textContent() ?? '';
  }

  /**
   * Click check balance button
   */
  async checkBalance(): Promise<void> {
    await this.page.click('#check-balance-btn');
  }

  /**
   * Get the displayed balance from balance check
   */
  async getBalanceCheckDisplay(): Promise<string> {
    return await this.page.locator('#balance-display').textContent() ?? '';
  }

  // ==================== DEPOSIT OPERATIONS ====================

  /**
   * Perform a deposit operation
   */
  async performDeposit(amount: number): Promise<void> {
    await this.page.fill('#deposit-amount', amount.toString());
    await this.page.click('#deposit-btn');
  }

  /**
   * Get deposit operation status message
   */
  async getDepositStatus(): Promise<string> {
    return await this.page.locator('#deposit-status').textContent() ?? '';
  }

  /**
   * Clear deposit input field
   */
  async clearDepositInput(): Promise<void> {
    await this.page.fill('#deposit-amount', '');
  }

  // ==================== DEBIT OPERATIONS ====================

  /**
   * Perform a debit operation
   */
  async performDebit(amount: number): Promise<void> {
    await this.page.fill('#debit-amount', amount.toString());
    await this.page.click('#debit-btn');
  }

  /**
   * Get debit operation status message
   */
  async getDebitStatus(): Promise<string> {
    return await this.page.locator('#debit-status').textContent() ?? '';
  }

  /**
   * Clear debit input field
   */
  async clearDebitInput(): Promise<void> {
    await this.page.fill('#debit-amount', '');
  }

  // ==================== TRANSACTION OPERATIONS ====================

  /**
   * Get count of transactions in the list
   */
  async getTransactionCount(): Promise<number> {
    return await this.page.locator('#transaction-list li').count();
  }

  /**
   * Get first transaction text
   */
  async getFirstTransactionText(): Promise<string> {
    return await this.page.locator('#transaction-list li').first().textContent() ?? '';
  }

  /**
   * Get all transactions as array of strings
   */
  async getAllTransactions(): Promise<string[]> {
    const transactions: string[] = [];
    const count = await this.page.locator('#transaction-list li').count();
    for (let i = 0; i < count; i++) {
      const text = await this.page.locator('#transaction-list li').nth(i).textContent();
      if (text) transactions.push(text);
    }
    return transactions;
  }

  /**
   * Check if transaction exists by description and amount
   */
  async transactionExists(description: string, amount: string): Promise<boolean> {
    const transactions = await this.getAllTransactions();
    return transactions.some(txn => txn.includes(description) && txn.includes(amount));
  }

  // ==================== ACCOUNT INFO ====================

  /**
   * Get account number
   */
  async getAccountNumber(): Promise<string> {
    return await this.page.locator('#account-number').textContent() ?? '';
  }

  /**
   * Get username display
   */
  async getUserName(): Promise<string> {
    return await this.page.locator('#user-name').textContent() ?? '';
  }

  /**
   * Get welcome message
   */
  async getWelcomeMessage(): Promise<string> {
    return await this.page.locator('h2').textContent() ?? '';
  }

  // ==================== PAGE VISIBILITY CHECKS ====================

  /**
   * Check if balance card is visible
   */
  async isBalanceCardVisible(): Promise<boolean> {
    return await this.page.locator('.balance-card').isVisible();
  }

  /**
   * Check if transaction list is visible
   */
  async isTransactionListVisible(): Promise<boolean> {
    return await this.page.locator('#transaction-list').isVisible();
  }

  /**
   * Check if login form is visible
   */
  async isLoginFormVisible(): Promise<boolean> {
    return await this.page.locator('#login-form').isVisible();
  }

  /**
   * Check if error message is visible
   */
  async isErrorMessageVisible(): Promise<boolean> {
    return await this.page.locator('#error-msg').isVisible();
  }

  /**
   * Get error message text
   */
  async getErrorMessage(): Promise<string> {
    return await this.page.locator('#error-msg').textContent() ?? '';
  }

  // ==================== PAGE TITLE AND URL ====================

  /**
   * Get page title
   */
  async getPageTitle(): Promise<string> {
    return await this.page.title();
  }

  /**
   * Get current URL
   */
  async getCurrentURL(): Promise<string> {
    return this.page.url();
  }

  // ==================== BENEFICIARY OPERATIONS ====================

  /**
   * Create a new beneficiary
   */
  async createBeneficiary(name: string, account: string, bank: string): Promise<void> {
    await this.page.fill('#beneficiary-name', name);
    await this.page.fill('#beneficiary-account', account);
    await this.page.fill('#beneficiary-bank', bank);
    await this.page.click('#add-beneficiary-btn');
  }

  /**
   * Get beneficiary status message
   */
  async getBeneficiaryStatus(): Promise<string> {
    return await this.page.locator('#beneficiary-status').textContent() ?? '';
  }

  /**
   * Get beneficiary count
   */
  async getBeneficiaryCount(): Promise<number> {
    return await this.page.locator('#beneficiary-list li').count();
  }

  /**
   * Get all beneficiaries text
   */
  async getAllBeneficiaries(): Promise<string[]> {
    const beneficiaries: string[] = [];
    const count = await this.page.locator('#beneficiary-list li').count();
    for (let i = 0; i < count; i++) {
      const text = await this.page.locator('#beneficiary-list li').nth(i).textContent();
      if (text) beneficiaries.push(text);
    }
    return beneficiaries;
  }

  /**
   * Check if beneficiary exists by name
   */
  async beneficiaryExists(name: string): Promise<boolean> {
    const beneficiaries = await this.getAllBeneficiaries();
    return beneficiaries.some(b => b.includes(name));
  }

  /**
   * Update a beneficiary using dialog prompts
   */
  async updateBeneficiary(beneficiaryIndex: number, newName: string, newAccount: string, newBank: string): Promise<void> {
    let promptCount = 0;
    this.page.on('dialog', async (dialog) => {
      if (promptCount === 0) {
        await dialog.accept(newName);
      } else if (promptCount === 1) {
        await dialog.accept(newAccount);
      } else if (promptCount === 2) {
        await dialog.accept(newBank);
      }
      promptCount++;
    });

    await this.page.click(`.edit-btn[data-id="${beneficiaryIndex}"]`);
    await this.page.waitForTimeout(500);
  }

  /**
   * Delete a beneficiary
   */
  async deleteBeneficiary(beneficiaryIndex: number): Promise<void> {
    this.page.on('dialog', async (dialog) => {
      await dialog.accept();
    });

    await this.page.click(`.delete-btn[data-id="${beneficiaryIndex}"]`);
    await this.page.waitForTimeout(500);
  }

  /**
   * Clear beneficiary input fields
   */
  async clearBeneficiaryInputs(): Promise<void> {
    await this.page.fill('#beneficiary-name', '');
    await this.page.fill('#beneficiary-account', '');
    await this.page.fill('#beneficiary-bank', '');
  }

  // ==================== WAIT AND UTILITY ====================

  /**
   * Wait for specific time (useful for animations/updates)
   */
  async wait(ms: number): Promise<void> {
    await this.page.waitForTimeout(ms);
  }

  /**
   * Wait for status message to disappear
   */
  async waitForStatusClear(statusSelector: string = '#deposit-status'): Promise<void> {
    await this.page.waitForTimeout(3000);
  }

  /**
   * Get page object for advanced operations
   */
  getPage(): Page {
    return this.page;
  }

  /**
   * Refresh the page
   */
  async refresh(): Promise<void> {
    await this.page.reload();
  }

  // ==================== MULTI-OPERATION FLOWS ====================

  /**
   * Login and navigate to dashboard (combined operation)
   */
  async loginAndNavigateToDashboard(username: string, password: string): Promise<void> {
    await this.login(username, password);
  }

  /**
   * Deposit and verify balance increased
   */
  async depositAndVerifyBalanceIncrease(amount: number): Promise<number> {
    const initialBalance = await this.getCurrentBalance();
    await this.performDeposit(amount);
    await this.wait(500);
    const newBalance = await this.getCurrentBalance();
    return newBalance - initialBalance;
  }

  /**
   * Debit and verify balance decreased
   */
  async debitAndVerifyBalanceDecrease(amount: number): Promise<number> {
    const initialBalance = await this.getCurrentBalance();
    await this.performDebit(amount);
    await this.wait(500);
    const newBalance = await this.getCurrentBalance();
    return initialBalance - newBalance;
  }

  /**
   * Perform multiple consecutive deposits
   */
  async performMultipleDeposits(amounts: number[]): Promise<void> {
    for (const amount of amounts) {
      await this.performDeposit(amount);
      await this.wait(300);
    }
  }

  /**
   * Perform multiple consecutive debits
   */
  async performMultipleDebits(amounts: number[]): Promise<void> {
    for (const amount of amounts) {
      await this.performDebit(amount);
      await this.wait(300);
    }
  }

  /**
   * Create multiple beneficiaries
   */
  async createMultipleBeneficiaries(beneficiaries: { name: string; account: string; bank: string }[]): Promise<void> {
    for (const beneficiary of beneficiaries) {
      await this.createBeneficiary(beneficiary.name, beneficiary.account, beneficiary.bank);
      await this.wait(300);
    }
  }
}
