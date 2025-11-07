import { Transaction, DailyBalance } from './types';

export function calculateDailyBalances(
  transactions: Transaction[],
  initialBalance: number = 0,
  startDate?: string,
  endDate?: string
): DailyBalance[] {
  // Sort transactions by date
  const sortedTransactions = [...transactions].sort((a, b) =>
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // Determine date range
  const dates = sortedTransactions.map(t => t.date);
  const minDate = startDate || (dates.length > 0 ? dates[0] : new Date().toISOString().split('T')[0]);
  const maxDate = endDate || (dates.length > 0 ? dates[dates.length - 1] : new Date().toISOString().split('T')[0]);

  // Group transactions by date
  const transactionsByDate = new Map<string, Transaction[]>();
  sortedTransactions.forEach(transaction => {
    const dateKey = transaction.date;
    if (!transactionsByDate.has(dateKey)) {
      transactionsByDate.set(dateKey, []);
    }
    transactionsByDate.get(dateKey)!.push(transaction);
  });

  // Calculate daily balances
  const dailyBalances: DailyBalance[] = [];
  let currentBalance = initialBalance;

  const start = new Date(minDate);
  const end = new Date(maxDate);

  for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
    const dateString = date.toISOString().split('T')[0];
    const dayTransactions = transactionsByDate.get(dateString) || [];

    const income = dayTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const expense = dayTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    currentBalance += income - expense;

    dailyBalances.push({
      date: dateString,
      balance: currentBalance,
      income,
      expense,
      transactions: dayTransactions,
    });
  }

  return dailyBalances;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('ja-JP', {
    style: 'currency',
    currency: 'JPY',
  }).format(amount);
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  }).format(date);
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
