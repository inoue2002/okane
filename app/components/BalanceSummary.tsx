"use client"

import { useState } from 'react';
import { formatCurrency } from '@/lib/utils';

interface BalanceSummaryProps {
  initialBalance: number;
  onUpdateInitialBalance: (balance: number) => void;
  currentBalance: number;
  totalIncome: number;
  totalExpense: number;
}

export default function BalanceSummary({
  initialBalance,
  onUpdateInitialBalance,
  currentBalance,
  totalIncome,
  totalExpense,
}: BalanceSummaryProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(initialBalance.toString());

  const handleSave = () => {
    const newBalance = parseFloat(editValue);
    if (!isNaN(newBalance)) {
      onUpdateInitialBalance(newBalance);
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditValue(initialBalance.toString());
    setIsEditing(false);
  };

  return (
    <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg shadow-lg p-6 mb-6 text-white">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <div className="text-sm opacity-90 mb-1">初期残高</div>
          {isEditing ? (
            <div className="flex gap-2">
              <input
                type="number"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                className="w-24 px-2 py-1 rounded bg-white/20 text-white placeholder-white/50 border border-white/30"
                autoFocus
              />
              <button
                onClick={handleSave}
                className="px-2 py-1 bg-white/20 hover:bg-white/30 rounded text-xs"
              >
                保存
              </button>
              <button
                onClick={handleCancel}
                className="px-2 py-1 bg-white/20 hover:bg-white/30 rounded text-xs"
              >
                キャンセル
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold">{formatCurrency(initialBalance)}</div>
              <button
                onClick={() => setIsEditing(true)}
                className="text-white/70 hover:text-white"
                aria-label="編集"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
              </button>
            </div>
          )}
        </div>

        <div>
          <div className="text-sm opacity-90 mb-1">総収入</div>
          <div className="text-2xl font-bold text-green-200">{formatCurrency(totalIncome)}</div>
        </div>

        <div>
          <div className="text-sm opacity-90 mb-1">総支出</div>
          <div className="text-2xl font-bold text-red-200">{formatCurrency(totalExpense)}</div>
        </div>

        <div>
          <div className="text-sm opacity-90 mb-1">現在残高</div>
          <div className={`text-2xl font-bold ${currentBalance >= 0 ? 'text-green-200' : 'text-red-200'}`}>
            {formatCurrency(currentBalance)}
          </div>
        </div>
      </div>
    </div>
  );
}
