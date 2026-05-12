"use client"

import { useState, useMemo } from 'react';
import { Transaction } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';

interface MonthlySummaryProps {
  transactions: Transaction[];
}

interface MonthlyData {
  yearMonth: string;
  year: number;
  month: number;
  income: number;
  expense: number;
}

export default function MonthlySummary({ transactions }: MonthlySummaryProps) {
  const [selectedYear, setSelectedYear] = useState<number | null>(
    new Date().getFullYear()
  );

  const monthlyData = useMemo(() => {
    const dataMap = new Map<string, MonthlyData>();

    transactions.forEach(t => {
      const date = new Date(t.date);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const yearMonth = `${year}-${month.toString().padStart(2, '0')}`;

      if (!dataMap.has(yearMonth)) {
        dataMap.set(yearMonth, {
          yearMonth,
          year,
          month,
          income: 0,
          expense: 0,
        });
      }

      const data = dataMap.get(yearMonth)!;
      if (t.type === 'income') {
        data.income += t.amount;
      } else {
        data.expense += t.amount;
      }
    });

    return dataMap;
  }, [transactions]);

  const years = useMemo(() => {
    const yearSet = new Set<number>();
    monthlyData.forEach(d => yearSet.add(d.year));
    return Array.from(yearSet).sort((a, b) => b - a);
  }, [monthlyData]);

  const chartData = useMemo<MonthlyData[]>(() => {
    if (selectedYear !== null) {
      return Array.from({ length: 12 }, (_, i) => {
        const month = i + 1;
        const ym = `${selectedYear}-${String(month).padStart(2, '0')}`;
        const existing = monthlyData.get(ym);
        return (
          existing ?? {
            yearMonth: ym,
            year: selectedYear,
            month,
            income: 0,
            expense: 0,
          }
        );
      });
    }

    if (monthlyData.size === 0) return [];
    const sortedKeys = Array.from(monthlyData.keys()).sort();
    const firstKey = sortedKeys[0];
    const today = new Date();
    const endYear = today.getFullYear();
    const endMonth = today.getMonth() + 1;

    const [fy, fm] = firstKey.split('-').map(Number);
    const result: MonthlyData[] = [];
    let y = fy;
    let m = fm;
    while (y < endYear || (y === endYear && m <= endMonth)) {
      const ym = `${y}-${String(m).padStart(2, '0')}`;
      const existing = monthlyData.get(ym);
      result.push(
        existing ?? {
          yearMonth: ym,
          year: y,
          month: m,
          income: 0,
          expense: 0,
        }
      );
      m += 1;
      if (m > 12) {
        m = 1;
        y += 1;
      }
    }
    return result;
  }, [monthlyData, selectedYear]);

  const yearlyTotals = useMemo(() => {
    return chartData.reduce(
      (acc, d) => ({
        income: acc.income + d.income,
        expense: acc.expense + d.expense,
      }),
      { income: 0, expense: 0 }
    );
  }, [chartData]);

  const maxValue = useMemo(() => {
    return chartData.reduce(
      (max, d) => Math.max(max, d.income, d.expense),
      0
    );
  }, [chartData]);

  const formatShortAmount = (n: number): string => {
    if (n === 0) return '';
    if (n >= 10000) {
      const man = n / 10000;
      return `${Math.round(man * 10) / 10}万`;
    }
    return `${Math.round(n / 1000)}千`;
  };

  if (transactions.length === 0) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-lg p-6 mb-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
          月別収支
        </h2>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setSelectedYear(null)}
            className={`px-3 py-1 rounded text-sm transition-colors ${
              selectedYear === null
                ? 'bg-blue-500 text-white'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
            }`}
          >
            すべて
          </button>
          {years.map(year => (
            <button
              key={year}
              onClick={() => setSelectedYear(year)}
              className={`px-3 py-1 rounded text-sm transition-colors ${
                selectedYear === year
                  ? 'bg-blue-500 text-white'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
              }`}
            >
              {year}年
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-zinc-50 dark:bg-zinc-800 rounded-lg">
        <div className="text-center">
          <div className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">
            {selectedYear ? `${selectedYear}年` : '全期間'}の収入
          </div>
          <div className="text-lg font-bold text-green-600 dark:text-green-400">
            {formatCurrency(yearlyTotals.income)}
          </div>
        </div>
        <div className="text-center">
          <div className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">
            {selectedYear ? `${selectedYear}年` : '全期間'}の支出
          </div>
          <div className="text-lg font-bold text-red-600 dark:text-red-400">
            {formatCurrency(yearlyTotals.expense)}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 mb-3 text-xs text-zinc-600 dark:text-zinc-400">
        <span className="inline-flex items-center gap-1">
          <span className="inline-block w-3 h-3 rounded-sm bg-green-500" />
          収入
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="inline-block w-3 h-3 rounded-sm bg-red-500" />
          支出
        </span>
      </div>

      {chartData.length === 0 ? (
        <div className="text-center py-8 text-zinc-500 dark:text-zinc-400">
          {selectedYear ? `${selectedYear}年のデータがありません` : 'データがありません'}
        </div>
      ) : (
        <div className="overflow-x-auto overflow-y-visible pt-5">
          <div
            className="flex items-end gap-2 sm:gap-3 pr-2"
            style={{ minWidth: `${chartData.length * 56}px` }}
          >
            {chartData.map(data => {
              const incomeHeight = maxValue > 0 ? (data.income / maxValue) * 100 : 0;
              const expenseHeight = maxValue > 0 ? (data.expense / maxValue) * 100 : 0;
              const isEmpty = data.income === 0 && data.expense === 0;
              return (
                <div
                  key={data.yearMonth}
                  className="flex-1 min-w-[44px] flex flex-col items-center"
                >
                  <div className="relative w-full h-48 flex items-end justify-center gap-1">
                    <div
                      className="relative flex-1 h-full max-w-[18px] bg-green-100 dark:bg-green-950/40 rounded-t-sm"
                      title={`収入 ${formatCurrency(data.income)}`}
                    >
                      <div
                        className="absolute bottom-0 left-0 right-0 bg-green-500 dark:bg-green-400 rounded-t-sm transition-all"
                        style={{ height: `${incomeHeight}%` }}
                      />
                      {data.income > 0 && (
                        <div
                          className="absolute left-1/2 -translate-x-1/2 text-[10px] font-medium text-green-700 dark:text-green-300 whitespace-nowrap pointer-events-none"
                          style={{ bottom: `calc(${incomeHeight}% + 2px)` }}
                        >
                          {formatShortAmount(data.income)}
                        </div>
                      )}
                    </div>
                    <div
                      className="relative flex-1 h-full max-w-[18px] bg-red-100 dark:bg-red-950/40 rounded-t-sm"
                      title={`支出 ${formatCurrency(data.expense)}`}
                    >
                      <div
                        className="absolute bottom-0 left-0 right-0 bg-red-500 dark:bg-red-400 rounded-t-sm transition-all"
                        style={{ height: `${expenseHeight}%` }}
                      />
                      {data.expense > 0 && (
                        <div
                          className="absolute left-1/2 -translate-x-1/2 text-[10px] font-medium text-red-700 dark:text-red-300 whitespace-nowrap pointer-events-none"
                          style={{ bottom: `calc(${expenseHeight}% + 2px)` }}
                        >
                          {formatShortAmount(data.expense)}
                        </div>
                      )}
                    </div>
                  </div>
                  <div
                    className={`mt-2 text-xs font-medium ${
                      isEmpty
                        ? 'text-zinc-400 dark:text-zinc-600'
                        : 'text-zinc-700 dark:text-zinc-300'
                    }`}
                  >
                    {selectedYear === null && data.month === 1
                      ? `${data.year}/1`
                      : `${data.month}月`}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
