"use client"

import { formatCurrency } from '@/lib/utils';

interface BalanceSummaryProps {
  year: number;
  todayBalance: number;
  yearIncome: number;
  yearExpense: number;
}

export default function BalanceSummary({
  year,
  todayBalance,
  yearIncome,
  yearExpense,
}: BalanceSummaryProps) {
  return (
    <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg shadow-lg p-6 mb-6 text-white">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <div className="text-sm opacity-90 mb-1">今日の残高</div>
          <div
            className={`text-3xl font-bold ${
              todayBalance >= 0 ? 'text-white' : 'text-red-200'
            }`}
          >
            {formatCurrency(todayBalance)}
          </div>
        </div>
        <div>
          <div className="text-sm opacity-90 mb-1">{year}年の収入</div>
          <div className="text-3xl font-bold text-green-200">
            {formatCurrency(yearIncome)}
          </div>
        </div>
        <div>
          <div className="text-sm opacity-90 mb-1">{year}年の支出</div>
          <div className="text-3xl font-bold text-red-200">
            {formatCurrency(yearExpense)}
          </div>
        </div>
      </div>
    </div>
  );
}
