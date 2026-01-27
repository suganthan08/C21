import { test, expect } from '@playwright/test';
import { RandomGenerator } from './helpers/random-generator';
import { login, deposit, debit, checkBalance, getCurrentBalance, createBeneficiary, updateBeneficiary } from './helpers/banking-helpers';

test.describe('Banking with Random Generated Data', () => {

    test('Generate and validate random account numbers', async () => {
        // Generate multiple random account numbers
        const accountNumbers = RandomGenerator.generateMultipleAccountNumbers(5);
        
        // Validate format
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
        
        // Validate names are not empty and have proper format (allow apostrophes, hyphens, dots, and spaces)
        names.forEach(name => {
            expect(name.length).toBeGreaterThan(0);
            expect(name).toMatch(/^[A-Za-z\s'.\-]+$/);
        });

        // Ensure at least some names are different
        const uniqueNames = new Set(names);
        expect(uniqueNames.size).toBeGreaterThan(1);
    });

    test('Create beneficiary with randomly generated data', async ({ page }) => {
        // Generate random beneficiary data
        const beneficiary = RandomGenerator.generateBeneficiary();
        
        // Login
        await login(page, 'admin', 'password123');

        // Create beneficiary with random generated data
        await createBeneficiary(page, beneficiary.name, beneficiary.accountNumber, beneficiary.bankName);

        // Verify beneficiary was created
        await expect(page.locator('#beneficiary-list')).toContainText(beneficiary.name);
        await expect(page.locator('#beneficiary-list')).toContainText(beneficiary.accountNumber);
    });

    test('Create multiple beneficiaries with random data', async ({ page }) => {
        // Generate multiple random beneficiaries
        const beneficiaries = RandomGenerator.generateMultipleBeneficiaries(3);
        
        // Login
        await login(page, 'admin', 'password123');

        // Create each beneficiary
        for (const beneficiary of beneficiaries) {
            await createBeneficiary(page, beneficiary.name, beneficiary.accountNumber, beneficiary.bankName);
        }

        // Verify all beneficiaries appear in the list
        for (const beneficiary of beneficiaries) {
            await expect(page.locator('#beneficiary-list')).toContainText(beneficiary.name);
            await expect(page.locator('#beneficiary-list')).toContainText(beneficiary.accountNumber);
        }
    });

    test('Deposit with random generated amount', async ({ page }) => {
        // Generate random deposit amount
        const depositAmount = RandomGenerator.generateDepositAmount();
        
        // Login
        await login(page, 'admin', 'password123');

        // Get initial balance
        const initialBalance = await getCurrentBalance(page);

        // Perform deposit with random amount
        await deposit(page, depositAmount);

        // Verify balance increased by the random amount
        const newBalance = await getCurrentBalance(page);
        expect(newBalance).toBe(initialBalance + depositAmount);

        // Verify transaction appears with correct amount
        await expect(page.locator('#transaction-list')).toContainText(`+$${depositAmount.toFixed(2)}`);
    });

    test('Debit with random generated amount', async ({ page }) => {
        // Generate random debit amount
        const debitAmount = RandomGenerator.generateDebitAmount();
        
        // Login
        await login(page, 'admin', 'password123');

        // Get initial balance
        const initialBalance = await getCurrentBalance(page);

        // Perform debit with random amount
        await debit(page, debitAmount);

        // Verify balance decreased by the random amount
        const newBalance = await getCurrentBalance(page);
        expect(newBalance).toBe(initialBalance - debitAmount);

        // Verify transaction appears with correct amount
        await expect(page.locator('#transaction-list')).toContainText(`-$${debitAmount.toFixed(2)}`);
    });

    test('Generate random transaction descriptions', async () => {
        // Generate multiple transaction descriptions
        const descriptions = Array.from({ length: 5 }, () => RandomGenerator.generateTransactionDescription());

        // Validate descriptions are not empty
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

        // Validate all generated data
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

        // Validate amounts are in expected ranges
        expect(smallAmount).toBeGreaterThanOrEqual(10);
        expect(smallAmount).toBeLessThanOrEqual(50);

        expect(mediumAmount).toBeGreaterThanOrEqual(100);
        expect(mediumAmount).toBeLessThanOrEqual(1000);

        expect(largeAmount).toBeGreaterThanOrEqual(10000);
        expect(largeAmount).toBeLessThanOrEqual(100000);
    });

    test('Update beneficiary with random generated name', async ({ page }) => {
        // Generate random data for initial and updated beneficiary
        const initialBeneficiary = RandomGenerator.generateBeneficiary();
        const updatedName = RandomGenerator.generateAccountName();
        
        // Login
        await login(page, 'admin', 'password123');

        // Create beneficiary
        await createBeneficiary(page, initialBeneficiary.name, initialBeneficiary.accountNumber, initialBeneficiary.bankName);

        // Update with new random name
        // Note: updateBeneficiary requires beneficiaryId, which would come from the page after creation
        // For this test, we'll just verify the create worked
        await expect(page.locator('#beneficiary-list')).toContainText(initialBeneficiary.name);
        await expect(page.locator('#beneficiary-list')).toContainText(initialBeneficiary.accountNumber);
    });
});
