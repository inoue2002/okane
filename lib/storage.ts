import { Transaction } from './types';

const STORAGE_KEYS = {
  TRANSACTIONS: 'okane_transactions',
  INITIAL_BALANCE: 'okane_initial_balance',
  RECURRING_TEMPLATES: 'okane_recurring_templates',
};

export function saveTransactions(transactions: Transaction[]): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
  }
}

export function loadTransactions(): Transaction[] {
  if (typeof window !== 'undefined') {
    const data = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    if (data) {
      try {
        return JSON.parse(data);
      } catch (error) {
        console.error('Failed to parse transactions:', error);
        return [];
      }
    }
  }
  return [];
}

export function saveInitialBalance(balance: number): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.INITIAL_BALANCE, balance.toString());
  }
}

export function loadInitialBalance(): number {
  if (typeof window !== 'undefined') {
    const data = localStorage.getItem(STORAGE_KEYS.INITIAL_BALANCE);
    if (data) {
      const balance = parseFloat(data);
      return isNaN(balance) ? 0 : balance;
    }
  }
  return 0;
}

export function clearAllData(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEYS.TRANSACTIONS);
    localStorage.removeItem(STORAGE_KEYS.INITIAL_BALANCE);
    localStorage.removeItem(STORAGE_KEYS.RECURRING_TEMPLATES);
  }
}

