import { faker } from '@faker-js/faker';

/**
 * Random data generator module using Faker.js
 * Provides methods to generate realistic test data for banking operations
 */

export class RandomGenerator {

  /**
   * Generate a random account number in format ACCT-XXXXXXXX
   * @returns {string} Account number like "ACCT-12345678"
   */
  static generateAccountNumber(): string {
    const randomDigits = faker.number.int({ min: 10000000, max: 99999999 });
    return `ACCT-${randomDigits}`;
  }

  /**
   * Generate a random account name (person's name)
   * @returns {string} Full name like "John Doe"
   */
  static generateAccountName(): string {
    return faker.person.fullName();
  }

  /**
   * Generate a random beneficiary name
   * @returns {string} Full name for a beneficiary
   */
  static generateBeneficiaryName(): string {
    return faker.person.fullName();
  }

  /**
   * Generate a random email address
   * @returns {string} Email address
   */
  static generateEmail(): string {
    return faker.internet.email();
  }

  /**
   * Generate a random phone number
   * @returns {string} Phone number
   */
  static generatePhoneNumber(): string {
    return faker.phone.number();
  }

  /**
   * Generate a random bank account number (IBAN-like format)
   * @returns {string} Bank account in format XX-XXXX-XXXX-XXXX
   */
  static generateBankAccountNumber(): string {
    return faker.finance.accountNumber(16);
  }

  /**
   * Generate a random routing number (9 digits)
   * @returns {string} Routing number like "123456789"
   */
  static generateRoutingNumber(): string {
    return faker.number.int({ min: 100000000, max: 999999999 }).toString();
  }

  /**
   * Generate a random IFSC code (Indian bank code)
   * @returns {string} IFSC code like "ABCD0123456"
   */
  static generateIFSCCode(): string {
    const letters = faker.string.alpha(4).toUpperCase();
    const digits = faker.number.int({ min: 0, max: 9999999 }).toString().padStart(7, '0');
    return `${letters}0${digits}`;
  }

  /**
   * Generate a random currency code
   * @returns {string} Currency code like "USD", "INR", "EUR"
   */
  static generateCurrencyCode(): string {
    const currencies = ['USD', 'INR', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD'];
    return faker.helpers.arrayElement(currencies);
  }

  /**
   * Generate a random transaction ID
   * @returns {string} Transaction ID like "TXN-1234567890ABCDEF"
   */
  static generateTransactionId(): string {
    const randomString = faker.string.alphanumeric(16).toUpperCase();
    return `TXN-${randomString}`;
  }

  /**
   * Generate a random amount (balance, transaction amount)
   * @param {number} min - Minimum amount (default: 100)
   * @param {number} max - Maximum amount (default: 100000)
   * @returns {number} Random amount with 2 decimal places
   */
  static generateAmount(min: number = 100, max: number = 100000): number {
    return Math.round(faker.number.float({ min, max, multipleOf: 0.01 }) * 100) / 100;
  }

  /**
   * Generate a random deposit amount
   * @returns {number} Random deposit amount between 50 and 5000
   */
  static generateDepositAmount(): number {
    return this.generateAmount(50, 5000);
  }

  /**
   * Generate a random debit amount
   * @returns {number} Random debit amount between 10 and 1000
   */
  static generateDebitAmount(): number {
    return this.generateAmount(10, 1000);
  }

  /**
   * Generate a random username
   * @returns {string} Username like "john_doe_123"
   */
  static generateUsername(): string {
    return faker.internet.username();
  }

  /**
   * Generate a random password (at least 8 characters with mixed case and numbers)
   * @returns {string} Strong password
   */
  static generatePassword(): string {
    return faker.internet.password({ length: 12, memorable: false });
  }

  /**
   * Generate a random branch name for a bank
   * @returns {string} Branch name like "Downtown Branch", "Tech Park Branch"
   */
  static generateBranchName(): string {
    const prefixes = ['Downtown', 'Uptown', 'Central', 'North', 'South', 'East', 'West', 'Tech Park', 'Business'];
    const suffix = faker.helpers.arrayElement(prefixes);
    return `${suffix} Branch`;
  }

  /**
   * Generate a random city name (for branch location)
   * @returns {string} City name
   */
  static generateCity(): string {
    return faker.location.city();
  }

  /**
   * Generate a random transaction description
   * @returns {string} Description like "Grocery Purchase", "Salary Deposit"
   */
  static generateTransactionDescription(): string {
    const descriptions = [
      'Grocery Purchase',
      'Salary Deposit',
      'Utility Payment',
      'Restaurant Bill',
      'Online Shopping',
      'ATM Withdrawal',
      'Bank Transfer',
      'Insurance Premium',
      'Subscription Fee',
      'Dividend Payment'
    ];
    return faker.helpers.arrayElement(descriptions);
  }

  /**
   * Generate multiple random account numbers
   * @param {number} count - Number of account numbers to generate
   * @returns {string[]} Array of account numbers
   */
  static generateMultipleAccountNumbers(count: number = 5): string[] {
    return Array.from({ length: count }, () => this.generateAccountNumber());
  }

  /**
   * Generate a beneficiary object with random data
   * @returns {object} Beneficiary object with account number, name, email, phone
   */
  static generateBeneficiary() {
    return {
      accountNumber: this.generateAccountNumber(),
      name: this.generateBeneficiaryName(),
      email: this.generateEmail(),
      phone: this.generatePhoneNumber(),
      bankName: faker.company.name(),
      ifscCode: this.generateIFSCCode()
    };
  }

  /**
   * Generate multiple beneficiaries
   * @param {number} count - Number of beneficiaries to generate
   * @returns {object[]} Array of beneficiary objects
   */
  static generateMultipleBeneficiaries(count: number = 3) {
    return Array.from({ length: count }, () => this.generateBeneficiary());
  }
}
