"use client"

import { useState } from 'react';
import { DailyBalance } from '@/lib/types';
import { formatCurrency, formatDate } from '@/lib/utils';

interface BalanceTimelineProps {
  dailyBalances: DailyBalance[];
  onDeleteTransaction: (id: string) => void;
  onUpdateTransactionDate: (id: string, newDate: string) => void;
}

export default function BalanceTimeline({ dailyBalances, onDeleteTransaction, onUpdateTransactionDate }: BalanceTimelineProps) {
  const [draggedTransactionId, setDraggedTransactionId] = useState<string | null>(null);
  const [dragOverDate, setDragOverDate] = useState<string | null>(null);

  // Filter to only show days with transactions
  const daysWithTransactions = dailyBalances.filter(day => day.transactions.length > 0);

  const handleDragStart = (transactionId: string) => {
    setDraggedTransactionId(transactionId);
  };

  const handleDragEnd = () => {
    setDraggedTransactionId(null);
    setDragOverDate(null);
  };

  const handleDragOver = (e: React.DragEvent, date: string) => {
    e.preventDefault();
    setDragOverDate(date);
  };

  const handleDragLeave = () => {
    setDragOverDate(null);
  };

  const handleDrop = (e: React.DragEvent, targetDate: string) => {
    e.preventDefault();
    if (draggedTransactionId && targetDate !== dragOverDate) {
      onUpdateTransactionDate(draggedTransactionId, targetDate);
    }
    setDraggedTransactionId(null);
    setDragOverDate(null);
  };

  if (daysWithTransactions.length === 0) {
    return (
      <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-md p-6 text-center text-zinc-500 dark:text-zinc-400">
        取引がまだありません。上のフォームから取引を追加してください。
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4 text-zinc-900 dark:text-zinc-50">
        取引履歴
      </h2>
      <div className="space-y-4">
        {daysWithTransactions.map((day) => (
        <div
          key={day.date}
          className={`bg-white dark:bg-zinc-900 rounded-lg shadow-md overflow-hidden transition-all ${
            dragOverDate === day.date ? 'ring-2 ring-blue-500 ring-offset-2' : ''
          }`}
          onDragOver={(e) => handleDragOver(e, day.date)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, day.date)}
        >
          <div className="bg-zinc-100 dark:bg-zinc-800 px-6 py-3 border-b border-zinc-200 dark:border-zinc-700">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                {formatDate(day.date)}
              </h3>
              <div className="text-right">
                <div className={`text-xl font-bold ${day.balance >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  残高: {formatCurrency(day.balance)}
                </div>
                {(day.income > 0 || day.expense > 0) && (
                  <div className="text-sm text-zinc-600 dark:text-zinc-400">
                    {day.income > 0 && <span className="text-green-600 dark:text-green-400">+{formatCurrency(day.income)}</span>}
                    {day.income > 0 && day.expense > 0 && ' / '}
                    {day.expense > 0 && <span className="text-red-600 dark:text-red-400">-{formatCurrency(day.expense)}</span>}
                  </div>
                )}
              </div>
            </div>
          </div>

          {day.transactions.length > 0 && (
            <div className="px-6 py-4">
              <div className="space-y-2">
                {day.transactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    draggable
                    onDragStart={() => handleDragStart(transaction.id)}
                    onDragEnd={handleDragEnd}
                    className={`flex justify-between items-start py-2 border-b border-zinc-100 dark:border-zinc-800 last:border-0 cursor-move transition-opacity ${
                      draggedTransactionId === transaction.id ? 'opacity-50' : 'opacity-100'
                    }`}
                  >
                    <div className="flex items-center gap-2 flex-1">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-zinc-400 dark:text-zinc-600 flex-shrink-0"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                      </svg>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                              transaction.type === 'income'
                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                            }`}
                          >
                            {transaction.type === 'income' ? '収入' : '支出'}
                          </span>
                          {transaction.category && (
                            <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                              {transaction.category}
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-zinc-900 dark:text-zinc-50">
                          {transaction.description}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 ml-4">
                      <span
                        className={`text-lg font-semibold ${
                          transaction.type === 'income'
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-red-600 dark:text-red-400'
                        }`}
                      >
                        {transaction.type === 'income' ? '+' : '-'}
                        {formatCurrency(transaction.amount)}
                      </span>
                      <button
                        onClick={() => onDeleteTransaction(transaction.id)}
                        className="text-zinc-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                        aria-label="削除"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        ))}
      </div>
    </div>
  );
}
