"use client"

import { useMemo } from 'react';
import { Transaction } from '@/lib/types';
import { formatCurrency, generateId } from '@/lib/utils';
import {
  computePatternMonthStatuses,
  createTransactionFromPattern,
  detectPatterns,
  getRecurringMonths,
  parseYearMonth,
} from '@/lib/recurring';

interface RecurringTemplatesProps {
  transactions: Transaction[];
  onAddTransaction: (transaction: Transaction) => void;
}

const MONTHS_BEFORE = 0;
const MONTHS_AFTER = 5; // 当月含めて6ヶ月

export default function RecurringTemplates({
  transactions,
  onAddTransaction,
}: RecurringTemplatesProps) {
  const yearMonths = useMemo(
    () => getRecurringMonths(MONTHS_BEFORE, MONTHS_AFTER),
    []
  );

  const currentYearMonth = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  }, []);

  const patterns = useMemo(() => detectPatterns(transactions, 2), [transactions]);

  const sortedPatterns = useMemo(() => {
    const counts = new Map<string, { matched: number; missing: number }>();
    for (const p of patterns) {
      const cells = computePatternMonthStatuses(p, yearMonths);
      counts.set(p.key, {
        matched: cells.filter(c => c.status === 'matched').length,
        missing: cells.filter(c => c.status === 'missing').length,
      });
    }
    return [...patterns].sort((a, b) => {
      const ca = counts.get(a.key)!;
      const cb = counts.get(b.key)!;
      if (cb.matched !== ca.matched) return cb.matched - ca.matched;
      if (cb.missing !== ca.missing) return cb.missing - ca.missing;
      return b.matchedMonths.size - a.matchedMonths.size;
    });
  }, [patterns, yearMonths]);

  const formatPatternLabel = (description: string) => {
    return description.replace(/[0-9０-９]+/g, 'X');
  };

  const formatMonthLabel = (ym: string) => {
    const { year, month } = parseYearMonth(ym);
    const current = parseYearMonth(currentYearMonth);
    if (year !== current.year) {
      return `${year % 100}/${month}`;
    }
    return `${month}月`;
  };

  return (
    <section className="bg-white dark:bg-zinc-900 rounded-lg shadow-md p-6 mb-6">
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
          定期取引（自動検出）
        </h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          過去2ヶ月以上に同じ説明で登録された取引から、繰り返しパターンを自動で検出します。<br />
          数字部分は無視するので「取引先1月」「取引先2月」も同じパターンとして扱われます。
        </p>
      </div>

      {patterns.length === 0 ? (
        <div className="text-center py-8 text-sm text-zinc-500 dark:text-zinc-400">
          まだ繰り返しパターンが検出されていません。<br />
          同じ説明で2ヶ月以上取引を登録すると、ここに表示されます。
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-700">
                <th className="text-left py-2 pr-3 font-medium text-zinc-600 dark:text-zinc-400 min-w-[140px]">
                  項目
                </th>
                <th className="text-right py-2 pr-3 font-medium text-zinc-600 dark:text-zinc-400 min-w-[110px]">
                  直近金額
                </th>
                {yearMonths.map((ym) => (
                  <th
                    key={ym}
                    className={`text-center py-2 px-1 font-medium ${
                      ym === currentYearMonth
                        ? 'text-blue-600 dark:text-blue-400'
                        : 'text-zinc-600 dark:text-zinc-400'
                    }`}
                  >
                    {formatMonthLabel(ym)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sortedPatterns.map((pattern) => {
                const cells = computePatternMonthStatuses(pattern, yearMonths);
                return (
                  <tr
                    key={pattern.key}
                    className="border-b border-zinc-100 dark:border-zinc-800"
                  >
                    <td className="py-3 pr-3">
                      <div className="font-medium text-zinc-900 dark:text-zinc-50">
                        {formatPatternLabel(pattern.displayDescription)}
                      </div>
                      <div className="text-xs text-zinc-500 dark:text-zinc-400">
                        {pattern.type === 'income' ? '収入' : '支出'} ・ 約
                        {pattern.typicalDay}日 ・ {pattern.matchedMonths.size}ヶ月に出現
                      </div>
                    </td>
                    <td className="py-3 pr-3 text-right tabular-nums text-zinc-700 dark:text-zinc-300">
                      {formatCurrency(pattern.suggestedAmount)}
                    </td>
                    {cells.map((cell) => {
                      const isCurrent = cell.yearMonth === currentYearMonth;
                      const baseRing = isCurrent
                        ? 'ring-1 ring-blue-400 dark:ring-blue-500'
                        : '';
                      if (cell.status === 'matched') {
                        return (
                          <td
                            key={cell.yearMonth}
                            className="py-2 px-1 text-center"
                          >
                            <span
                              className={`inline-flex items-center justify-center w-8 h-8 rounded-full bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300 ${baseRing}`}
                              title={`${cell.yearMonth} に登録済み`}
                            >
                              ✓
                            </span>
                          </td>
                        );
                      }
                      if (cell.status === 'missing') {
                        return (
                          <td
                            key={cell.yearMonth}
                            className="py-2 px-1 text-center"
                          >
                            <button
                              type="button"
                              onClick={() =>
                                onAddTransaction(
                                  createTransactionFromPattern(pattern, cell.yearMonth, generateId)
                                )
                              }
                              className={`inline-flex items-center justify-center w-8 h-8 rounded-full bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/40 dark:text-red-300 dark:hover:bg-red-900/60 transition-colors ${baseRing}`}
                              title={`${cell.yearMonth} に未登録 — クリックで直近金額で追加`}
                            >
                              !
                            </button>
                          </td>
                        );
                      }
                      return (
                        <td
                          key={cell.yearMonth}
                          className="py-2 px-1 text-center"
                        >
                          <button
                            type="button"
                            onClick={() =>
                              onAddTransaction(
                                createTransactionFromPattern(pattern, cell.yearMonth, generateId)
                              )
                            }
                            className={`inline-flex items-center justify-center w-8 h-8 rounded-full border border-dashed border-zinc-300 text-zinc-400 hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-500 dark:hover:bg-zinc-800 transition-colors ${baseRing}`}
                            title={`${cell.yearMonth} の予定 — クリックで先に追加`}
                          >
                            ・
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div className="flex flex-wrap items-center gap-3 mt-4 text-xs text-zinc-500 dark:text-zinc-400">
            <span className="inline-flex items-center gap-1">
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300 text-[10px]">✓</span>
              登録済み
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300 text-[10px]">!</span>
              未登録（クリックで追加）
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full border border-dashed border-zinc-300 dark:border-zinc-600 text-[10px]">・</span>
              予定
            </span>
          </div>
        </div>
      )}
    </section>
  );
}
