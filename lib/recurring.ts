import {
  Transaction,
  DetectedPattern,
  RecurringMonthCell,
} from './types';

// 説明文の正規化キー: 数字（半角/全角）を除き、空白詰めと小文字化を行う。
// 「取引先1月」「取引先2月」が同一パターンとして扱われるようにする。
export function normalizeKey(description: string): string {
  return description
    .normalize('NFKC')
    .toLowerCase()
    .replace(/[0-9]+/g, '')
    .replace(/\s+/g, '')
    .trim();
}

export function formatYearMonth(year: number, month: number): string {
  return `${year}-${String(month).padStart(2, '0')}`;
}

export function parseYearMonth(yearMonth: string): { year: number; month: number } {
  const [y, m] = yearMonth.split('-').map(Number);
  return { year: y, month: m };
}

export function clampDayOfMonth(year: number, month: number, day: number): number {
  const lastDay = new Date(year, month, 0).getDate();
  return Math.min(Math.max(day, 1), lastDay);
}

export function buildDateString(year: number, month: number, day: number): string {
  const d = clampDayOfMonth(year, month, day);
  return `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

export function getRecurringMonths(
  monthsBefore: number,
  monthsAfter: number,
  reference: Date = new Date()
): string[] {
  const result: string[] = [];
  const baseYear = reference.getFullYear();
  const baseMonth = reference.getMonth() + 1;
  for (let i = -monthsBefore; i <= monthsAfter; i++) {
    const d = new Date(baseYear, baseMonth - 1 + i, 1);
    result.push(formatYearMonth(d.getFullYear(), d.getMonth() + 1));
  }
  return result;
}

export function detectPatterns(
  transactions: Transaction[],
  minMonths: number = 2
): DetectedPattern[] {
  const groups = new Map<string, Transaction[]>();

  for (const t of transactions) {
    const key = `${t.type}::${normalizeKey(t.description)}`;
    if (!key.split('::')[1]) continue; // 空キーはスキップ
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(t);
  }

  const patterns: DetectedPattern[] = [];

  for (const [key, items] of groups) {
    const monthsSet = new Set<string>();
    for (const t of items) {
      monthsSet.add(t.date.slice(0, 7));
    }
    if (monthsSet.size < minMonths) continue;

    const sorted = [...items].sort((a, b) => b.date.localeCompare(a.date));
    const latest = sorted[0];
    const day = parseInt(latest.date.slice(8, 10), 10);

    patterns.push({
      key,
      displayDescription: latest.description,
      type: latest.type,
      suggestedAmount: latest.amount,
      typicalDay: day,
      matchedMonths: monthsSet,
      latestTransaction: latest,
    });
  }

  patterns.sort((a, b) => b.matchedMonths.size - a.matchedMonths.size);
  return patterns;
}

export function computePatternMonthStatuses(
  pattern: DetectedPattern,
  yearMonths: string[],
  today: Date = new Date()
): RecurringMonthCell[] {
  const todayString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  return yearMonths.map((ym) => {
    if (pattern.matchedMonths.has(ym)) {
      return { yearMonth: ym, status: 'matched' as const };
    }
    const { year, month } = parseYearMonth(ym);
    const dueDate = buildDateString(year, month, pattern.typicalDay);
    return {
      yearMonth: ym,
      status: dueDate <= todayString ? 'missing' : 'upcoming',
    };
  });
}

export function createTransactionFromPattern(
  pattern: DetectedPattern,
  yearMonth: string,
  generateId: () => string
): Transaction {
  const { year, month } = parseYearMonth(yearMonth);
  return {
    id: generateId(),
    date: buildDateString(year, month, pattern.typicalDay),
    type: pattern.type,
    amount: pattern.suggestedAmount,
    description: pattern.displayDescription,
    category: pattern.latestTransaction.category,
  };
}
