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
  const [selectedYear, setSelectedYear] = useState<number | null>(null);

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

    return Array.from(dataMap.values()).sort((a, b) =>
      b.yearMonth.localeCompare(a.yearMonth)
    );
  }, [transactions]);

  const years = useMemo(() => {
    const yearSet = new Set(monthlyData.map(d => d.year));
    return Array.from(yearSet).sort((a, b) => b - a);
  }, [monthlyData]);

  const filteredData = useMemo(() => {
    if (selectedYear === null) return monthlyData;
    return monthlyData.filter(d => d.year === selectedYear);
  }, [monthlyData, selectedYear]);

  const yearlyTotals = useMemo(() => {
    return filteredData.reduce(
      (acc, d) => ({
        income: acc.income + d.income,
        expense: acc.expense + d.expense,
      }),
      { income: 0, expense: 0 }
    );
  }, [filteredData]);

  const formatMonth = (month: number) => {
    return `${month}月`;
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

      {/* 合計サマリー */}
      <div className="grid grid-cols-2 gap-4 mb-4 p-4 bg-zinc-50 dark:bg-zinc-800 rounded-lg">
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

      {/* 月別テーブル */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-zinc-200 dark:border-zinc-700">
              <th className="text-left py-2 px-3 text-sm font-medium text-zinc-600 dark:text-zinc-400">
                月
              </th>
              <th className="text-right py-2 px-3 text-sm font-medium text-zinc-600 dark:text-zinc-400">
                収入
              </th>
              <th className="text-right py-2 px-3 text-sm font-medium text-zinc-600 dark:text-zinc-400">
                支出
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map(data => (
              <tr
                key={data.yearMonth}
                className="border-b border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
              >
                <td className="py-3 px-3 text-zinc-900 dark:text-zinc-100">
                  {selectedYear === null ? `${data.year}年` : ''}{formatMonth(data.month)}
                </td>
                <td className="py-3 px-3 text-right text-green-600 dark:text-green-400">
                  {formatCurrency(data.income)}
                </td>
                <td className="py-3 px-3 text-right text-red-600 dark:text-red-400">
                  {formatCurrency(data.expense)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredData.length === 0 && (
        <div className="text-center py-8 text-zinc-500 dark:text-zinc-400">
          {selectedYear ? `${selectedYear}年のデータがありません` : 'データがありません'}
        </div>
      )}
    </div>
  );
}
