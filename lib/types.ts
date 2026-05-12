export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  date: string; // ISO date string (YYYY-MM-DD)
  type: TransactionType;
  amount: number;
  description: string;
  category?: string;
}

export interface DailyBalance {
  date: string;
  balance: number;
  income: number;
  expense: number;
  transactions: Transaction[];
}

export type RecurringMonthStatus = 'matched' | 'missing' | 'upcoming';

export interface RecurringMonthCell {
  yearMonth: string; // YYYY-MM
  status: RecurringMonthStatus;
  matchedTransactionId?: string;
}

export interface DetectedPattern {
  key: string; // 正規化済みキー
  displayDescription: string; // 直近の取引で使われた説明
  type: TransactionType;
  suggestedAmount: number; // 直近の金額
  typicalDay: number; // 直近の日
  matchedMonths: Set<string>; // YYYY-MM
  latestTransaction: Transaction;
}
