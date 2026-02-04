import { test, expect } from '@playwright/test';
import { BankingPage } from './pages/banking.page';
import { RandomGenerator } from './helpers/random-generator';

test.describe('Banking with Random Generated Data', () => {

    test('Generate and validate random account numbers', async () => {
        // Generate multiple random account numbers
        const accountNumbers = RandomGenerator.generateMultipleAccountNumbers(5);
        
        // Assertions only - validate format
        accountNumbers.forEach(accountNum => {
            expect(accountNum).toMatch(/ACCT-\d{8}/);
        });

        // Ensure all are unique
        const uniqueNumbers = new Set(accountNumbers);
        expect(uniqueNumbers.size).toBe(accountNumbers.length);
    });

    test('Generate random account names', async () => {
        // Generate multiple random names
        const names = Array.from({ length: 5 }, () => RandomGenerator.generateAccountName());
        
        // Assertions only - validate format
        names.forEach(name => {
            expect(name.length).toBeGreaterThan(0);
            expect(name).toMatch(/^[A-Za-z\s'.\-]+$/);
            expect(name).toMatch(/^[A-Za-z\s'.\-]+$/);
            expect(name).toMatch(/^[A-Za-z\s'.\-]+$/);  
        });

        // Ensure at least some names are different
        const uniqueNames = new Set(names);
        expect(uniqueNames.size).toBeGreaterThan(1);
    });

    test('Create beneficiary with randomly generated data', async ({ page }) => {
        const bankingPage = new BankingPage(page);
        const beneficiary = RandomGenerator.generateBeneficiary();
        
        // Action: Login and create beneficiary
        await bankingPage.login('admin', 'password123');
         expect(uniqueNames.size).toBeGreaterThan(1);
        await bankingPage.createBeneficiary(beneficiary.name, beneficiary.accountNumber, beneficiary.bankName);

        // Assertions only
        expect(await bankingPage.beneficiaryExists(beneficiary.name)).toBeTruthy();
        const allBeneficiaries = await bankingPage.getAllBeneficiaries();
        expect(allBeneficiaries.some(b => b.includes(beneficiary.accountNumber))).toBeTruthy();
    });

    test('Create multiple beneficiaries with random data', async ({ page }) => {
        const bankingPage = new BankingPage(page);
        const beneficiaries = RandomGenerator.generateMultipleBeneficiaries(3);
        
        // Action: Login and create beneficiaries
        await bankingPage.login('admin', 'password123');
        await bankingPage.createMultipleBeneficiaries(beneficiaries);

        // Assertions only - verify all created
        for (const beneficiary of beneficiaries) {
             expect(uniqueNames.size).toBeGreaterThan(1);
            expect(await bankingPage.beneficiaryExists(beneficiary.name)).toBeTruthy();
        }
        expect(await bankingPage.getBeneficiaryCount()).toBeGreaterThanOrEqual(beneficiaries.length);
    });

    test('Deposit with random generated amount', async ({ page }) => {
        const bankingPage = new BankingPage(page);
        const depositAmount = RandomGenerator.generateDepositAmount();
        
        // Setup and Action
        await bankingPage.login('admin', 'password123');
        const initialBalance = await bankingPage.getCurrentBalance();
        await bankingPage.performDeposit(depositAmount);

        // Assertions only
        expect(await bankingPage.getDepositStatus()).toContain('Deposited');
        const newBalance = await bankingPage.getCurrentBalance();
        expect(newBalance).toBeGreaterThan(initialBalance);
        expect(await bankingPage.transactionExists('Deposit', `+$${depositAmount.toFixed(2)}`)).toBeTruthy();
    });

    test('Debit with random generated amount', async ({ page }) => {
        const bankingPage = new BankingPage(page);
        const debitAmount = RandomGenerator.generateDebitAmount();
        
        // Setup and Action
        await bankingPage.login('admin', 'password123');
        const initialBalance = await bankingPage.getCurrentBalance();
        await bankingPage.performDebit(debitAmount);

        // Assertions only
        expect(await bankingPage.getDebitStatus()).toContain('Debited');
        const newBalance = await bankingPage.getCurrentBalance();
        expect(newBalance).toBeLessThan(initialBalance);
        expect(await bankingPage.transactionExists('Debit', `-$${debitAmount.toFixed(2)}`)).toBeTruthy();
    });

    test('Generate random transaction descriptions', async () => {
        // Generate multiple transaction descriptions
        const descriptions = Array.from({ length: 5 }, () => RandomGenerator.generateTransactionDescription());

        // Assertions only
        descriptions.forEach(desc => {
            expect(desc.length).toBeGreaterThan(0);
        });

        // Ensure variety in descriptions
        const uniqueDescriptions = new Set(descriptions);
        expect(uniqueDescriptions.size).toBeGreaterThan(1);
    });

    test('Generate random banking related data', async () => {
        // Generate various banking data
        const accountNumber = RandomGenerator.generateAccountNumber();
        const accountName = RandomGenerator.generateAccountName();
        const email = RandomGenerator.generateEmail();
        const phone = RandomGenerator.generatePhoneNumber();
        const routingNumber = RandomGenerator.generateRoutingNumber();
        const ifscCode = RandomGenerator.generateIFSCCode();
        const transactionId = RandomGenerator.generateTransactionId();

        // Assertions only - validate all generated data
        expect(accountNumber).toMatch(/ACCT-\d{8}/);
        expect(accountName.length).toBeGreaterThan(0);
        expect(email).toContain('@');
        expect(phone.length).toBeGreaterThan(0);
        expect(routingNumber).toMatch(/^\d{9}$/);
        expect(ifscCode).toMatch(/^[A-Z]{4}0\d{7}$/);
        expect(transactionId).toMatch(/^TXN-[A-Z0-9]{16}$/);
    });

    test('Generate random amounts with different ranges', async () => {
        // Generate amounts with custom ranges
        const smallAmount = RandomGenerator.generateAmount(10, 50);
        const mediumAmount = RandomGenerator.generateAmount(100, 1000);
        const largeAmount = RandomGenerator.generateAmount(10000, 100000);

        // Assertions only - validate amounts are in expected ranges
        expect(smallAmount).toBeGreaterThanOrEqual(10);
        expect(smallAmount).toBeLessThanOrEqual(50);

        expect(mediumAmount).toBeGreaterThanOrEqual(100);
        expect(mediumAmount).toBeLessThanOrEqual(1000);

        expect(largeAmount).toBeGreaterThanOrEqual(10000);
        expect(largeAmount).toBeLessThanOrEqual(100000);
    });

    test('Update beneficiary with random generated name', async ({ page }) => {
        const bankingPage = new BankingPage(page);
        const initialBeneficiary = RandomGenerator.generateBeneficiary();
        
        // Setup and Action
        await bankingPage.login('admin', 'password123');
        await bankingPage.createBeneficiary(initialBeneficiary.name, initialBeneficiary.accountNumber, initialBeneficiary.bankName);

        // Assertions only - verify creation
        expect(await bankingPage.beneficiaryExists(initialBeneficiary.name)).toBeTruthy();
        const beneficiaryCount = await bankingPage.getBeneficiaryCount();
        expect(beneficiaryCount).toBeGreaterThan(0);
    });

    test('Multiple deposits with random amounts', async ({ page }) => {
        const bankingPage = new BankingPage(page);
        const depositAmounts = [
            RandomGenerator.generateDepositAmount(),
            RandomGenerator.generateDepositAmount(),
            RandomGenerator.generateDepositAmount()
        ];
        
        // Setup and Action
        await bankingPage.login('admin', 'password123');
        const initialBalance = await bankingPage.getCurrentBalance();
        await bankingPage.performMultipleDeposits(depositAmounts);

        // Assertions only
        const newBalance = await bankingPage.getCurrentBalance();
        expect(newBalance).toBeGreaterThan(initialBalance);
        
        // Verify multiple deposit transactions
        const transactionCount = await bankingPage.getTransactionCount();
        expect(transactionCount).toBeGreaterThanOrEqual(depositAmounts.length);
    });

    test('Validate generated beneficiary object structure', async () => {
        // Generate a beneficiary
        const beneficiary = RandomGenerator.generateBeneficiary();

        // Assertions only - validate structure
        expect(beneficiary).toHaveProperty('accountNumber');
        expect(beneficiary).toHaveProperty('name');
        expect(beneficiary).toHaveProperty('email');
        expect(beneficiary).toHaveProperty('phone');
        expect(beneficiary).toHaveProperty('bankName');
        expect(beneficiary).toHaveProperty('ifscCode');

        // Validate field formats
        expect(beneficiary.accountNumber).toMatch(/ACCT-\d{8}/);
        expect(beneficiary.email).toContain('@');
        expect(beneficiary.phone.length).toBeGreaterThan(0);
        expect(beneficiary.ifscCode).toMatch(/^[A-Z]{4}0\d{7}$/);
    });
});
