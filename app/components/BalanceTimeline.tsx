"use client"

import { useState, useRef, useEffect, useCallback } from 'react';
import { DailyBalance } from '@/lib/types';
import { formatCurrency, formatDate } from '@/lib/utils';

// Get today's date as YYYY-MM-DD string
function getToday(): string {
  return new Date().toISOString().split('T')[0];
}

interface BalanceTimelineProps {
  dailyBalances: DailyBalance[];
  onDeleteTransaction: (id: string) => void;
  onUpdateTransactionDate: (id: string, newDate: string) => void;
  onUpdateTransactionAmount: (id: string, newAmount: number) => void;
}

// Generate dates between two dates (exclusive of start, inclusive of end)
function getDatesBetween(startDate: string, endDate: string): string[] {
  const dates: string[] = [];
  const start = new Date(startDate);
  const end = new Date(endDate);

  // Start from the day after startDate
  const current = new Date(start);
  current.setDate(current.getDate() + 1);

  while (current < end) {
    dates.push(current.toISOString().split('T')[0]);
    current.setDate(current.getDate() + 1);
  }

  return dates;
}

export default function BalanceTimeline({ dailyBalances, onDeleteTransaction, onUpdateTransactionDate, onUpdateTransactionAmount }: BalanceTimelineProps) {
  const [draggedTransactionId, setDraggedTransactionId] = useState<string | null>(null);
  const [dragOverDate, setDragOverDate] = useState<string | null>(null);
  const [expandedGaps, setExpandedGaps] = useState<Set<string>>(new Set());
  const [editingTransactionId, setEditingTransactionId] = useState<string | null>(null);
  const [editingAmount, setEditingAmount] = useState<string>('');

  const containerRef = useRef<HTMLDivElement>(null);
  const todayRef = useRef<HTMLDivElement>(null);
  const today = getToday();

  // Filter to only show days with transactions
  const daysWithTransactions = dailyBalances.filter(day => day.transactions.length > 0);

  // Find today or the closest date to today
  const findTodayOrClosestIndex = useCallback(() => {
    if (daysWithTransactions.length === 0) return -1;

    // Check if today exists
    const todayIndex = daysWithTransactions.findIndex(day => day.date === today);
    if (todayIndex !== -1) return todayIndex;

    // Find the closest future date (first date >= today)
    const futureIndex = daysWithTransactions.findIndex(day => day.date >= today);
    if (futureIndex !== -1) return futureIndex;

    // If no future dates, return the last (most recent past) date
    return daysWithTransactions.length - 1;
  }, [daysWithTransactions, today]);

  const todayOrClosestIndex = findTodayOrClosestIndex();

  // Scroll to today on mount
  useEffect(() => {
    if (todayRef.current && containerRef.current) {
      // Small delay to ensure DOM is ready
      setTimeout(() => {
        todayRef.current?.scrollIntoView({ block: 'start' });
      }, 100);
    }
  }, [daysWithTransactions.length]);

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
    if (draggedTransactionId) {
      onUpdateTransactionDate(draggedTransactionId, targetDate);
    }
    setDraggedTransactionId(null);
    setDragOverDate(null);
    setExpandedGaps(new Set());
  };

  const toggleGap = (gapKey: string) => {
    setExpandedGaps(prev => {
      const newSet = new Set(prev);
      if (newSet.has(gapKey)) {
        newSet.delete(gapKey);
      } else {
        newSet.add(gapKey);
      }
      return newSet;
    });
  };

  const handleStartEditAmount = (transactionId: string, currentAmount: number) => {
    setEditingTransactionId(transactionId);
    setEditingAmount(currentAmount.toString());
  };

  const handleSaveAmount = () => {
    if (editingTransactionId) {
      const newAmount = parseFloat(editingAmount);
      if (!isNaN(newAmount) && newAmount > 0) {
        onUpdateTransactionAmount(editingTransactionId, newAmount);
      }
    }
    setEditingTransactionId(null);
    setEditingAmount('');
  };

  const handleCancelEdit = () => {
    setEditingTransactionId(null);
    setEditingAmount('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveAmount();
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  // Render empty drop zone for a date without transactions
  const renderEmptyDropZone = (date: string) => (
    <div
      key={`empty-${date}`}
      className={`border-2 border-dashed rounded-lg p-4 transition-all ${
        dragOverDate === date
          ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
          : 'border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900'
      }`}
      onDragOver={(e) => handleDragOver(e, date)}
      onDragLeave={handleDragLeave}
      onDrop={(e) => handleDrop(e, date)}
    >
      <div className="text-center text-zinc-500 dark:text-zinc-400 text-sm">
        {formatDate(date)}
      </div>
    </div>
  );

  // Render gap indicator between two dates
  const renderGapIndicator = (startDate: string, endDate: string, index: number) => {
    const datesBetween = getDatesBetween(startDate, endDate);
    if (datesBetween.length === 0) return null;

    const gapKey = `gap-${index}`;
    const isExpanded = expandedGaps.has(gapKey);

    return (
      <div key={gapKey} className="my-2">
        {!isExpanded ? (
          <button
            onClick={() => toggleGap(gapKey)}
            className="w-full flex items-center justify-center gap-2 py-2 text-zinc-400 dark:text-zinc-600 hover:text-zinc-600 dark:hover:text-zinc-400 transition-colors"
          >
            <div className="flex-1 border-t border-dashed border-zinc-300 dark:border-zinc-700" />
            <span className="text-xs px-2 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors">
              {datesBetween.length}日分の空きスロットを表示
            </span>
            <div className="flex-1 border-t border-dashed border-zinc-300 dark:border-zinc-700" />
          </button>
        ) : (
          <div className="space-y-2">
            <button
              onClick={() => toggleGap(gapKey)}
              className="w-full flex items-center justify-center gap-2 py-1 text-zinc-400 dark:text-zinc-600 hover:text-zinc-600 dark:hover:text-zinc-400 transition-colors"
            >
              <span className="text-xs">閉じる</span>
            </button>
            {datesBetween.map(date => renderEmptyDropZone(date))}
          </div>
        )}
      </div>
    );
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
      <div
        ref={containerRef}
        className="space-y-4 max-h-[600px] overflow-y-auto pr-2"
      >
        {daysWithTransactions.map((day, index) => {
          const isToday = day.date === today;
          const isTarget = index === todayOrClosestIndex;

          return (
          <div
            key={day.date}
            ref={isTarget ? todayRef : null}
          >
            {/* Gap indicator before this day (if there's a gap from previous day) */}
            {index > 0 && renderGapIndicator(daysWithTransactions[index - 1].date, day.date, index)}
            <div
              className={`bg-white dark:bg-zinc-900 rounded-lg shadow-md overflow-hidden transition-all ${
                dragOverDate === day.date ? 'ring-2 ring-blue-500 ring-offset-2' : ''
              } ${isToday ? 'ring-2 ring-blue-500 dark:ring-blue-400' : ''}`}
              onDragOver={(e) => handleDragOver(e, day.date)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, day.date)}
            >
              <div className={`px-6 py-3 border-b border-zinc-200 dark:border-zinc-700 ${
                isToday ? 'bg-blue-100 dark:bg-blue-900' : 'bg-zinc-100 dark:bg-zinc-800'
              }`}>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                      {formatDate(day.date)}
                    </h3>
                    {isToday && (
                      <span className="px-2 py-0.5 text-xs font-medium bg-blue-500 text-white rounded-full">
                        今日
                      </span>
                    )}
                  </div>
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
                          {editingTransactionId === transaction.id ? (
                            <div className="flex items-center gap-2">
                              <span className={transaction.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                                {transaction.type === 'income' ? '+' : '-'}¥
                              </span>
                              <input
                                type="number"
                                value={editingAmount}
                                onChange={(e) => setEditingAmount(e.target.value)}
                                onKeyDown={handleKeyDown}
                                onBlur={handleSaveAmount}
                                className="w-24 px-2 py-1 text-right text-lg font-semibold border border-zinc-300 dark:border-zinc-600 rounded bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50"
                                autoFocus
                              />
                            </div>
                          ) : (
                            <button
                              onClick={() => handleStartEditAmount(transaction.id, transaction.amount)}
                              className={`text-lg font-semibold hover:underline cursor-pointer ${
                                transaction.type === 'income'
                                  ? 'text-green-600 dark:text-green-400'
                                  : 'text-red-600 dark:text-red-400'
                              }`}
                              title="クリックして金額を編集"
                            >
                              {transaction.type === 'income' ? '+' : '-'}
                              {formatCurrency(transaction.amount)}
                            </button>
                          )}
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
          </div>
          );
        })}
      </div>
    </div>
  );
}
