"use client"

import { useState } from 'react';
import { Transaction, TransactionType } from '@/lib/types';
import { generateId } from '@/lib/utils';

interface TransactionFormProps {
  onAddTransaction: (transaction: Transaction) => void;
}

export default function TransactionForm({ onAddTransaction }: TransactionFormProps) {
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth() + 1;
  const currentDay = today.getDate();

  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedDay, setSelectedDay] = useState(currentDay);
  const [type, setType] = useState<TransactionType>('income');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');

  // Generate array of days for selected month
  const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!amount || parseFloat(amount) <= 0) {
      alert('金額を正しく入力してください');
      return;
    }

    if (!description.trim()) {
      alert('説明を入力してください');
      return;
    }

    // Create date string in YYYY-MM-DD format
    const dateString = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`;

    const transaction: Transaction = {
      id: generateId(),
      date: dateString,
      type,
      amount: parseFloat(amount),
      description: description.trim(),
      category: category.trim() || undefined,
    };

    onAddTransaction(transaction);

    // Reset form
    setAmount('');
    setDescription('');
    setCategory('');
    // Reset to today's date
    setSelectedYear(currentYear);
    setSelectedMonth(currentMonth);
    setSelectedDay(currentDay);
  };

  const months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];

  return (
    <form onSubmit={handleSubmit}>
      {/* Transaction Type */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3">
          種類
        </label>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setType('income')}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
              type === 'income'
                ? 'bg-green-600 text-white shadow-md scale-105'
                : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'
            }`}
          >
            💰 収入
          </button>
          <button
            type="button"
            onClick={() => setType('expense')}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
              type === 'expense'
                ? 'bg-red-600 text-white shadow-md scale-105'
                : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'
            }`}
          >
            💸 支出
          </button>
        </div>
      </div>

      {/* Year Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3">
          年
        </label>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setSelectedYear(currentYear)}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
              selectedYear === currentYear
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'
            }`}
          >
            {currentYear}年
          </button>
          <button
            type="button"
            onClick={() => setSelectedYear(currentYear + 1)}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
              selectedYear === currentYear + 1
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'
            }`}
          >
            {currentYear + 1}年
          </button>
        </div>
      </div>

      {/* Month Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3">
          月
        </label>
        <div className="grid grid-cols-6 gap-2">
          {months.map((month, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setSelectedMonth(index + 1)}
              className={`py-2 px-3 rounded-md text-sm font-medium transition-all ${
                selectedMonth === index + 1
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'
              }`}
            >
              {month}
            </button>
          ))}
        </div>
      </div>

      {/* Day Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3">
          日
        </label>
        <div className="grid grid-cols-7 gap-2 max-h-48 overflow-y-auto p-2 border border-zinc-200 dark:border-zinc-700 rounded-lg">
          {days.map((day) => (
            <button
              key={day}
              type="button"
              onClick={() => setSelectedDay(day)}
              className={`py-2 px-3 rounded-md text-sm font-medium transition-all ${
                selectedDay === day
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'
              }`}
            >
              {day}
            </button>
          ))}
        </div>
      </div>

      {/* Amount */}
      <div className="mb-4">
        <label htmlFor="amount" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
          金額（円）
        </label>
        <input
          type="number"
          id="amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="10000"
          min="0"
          step="1"
          className="w-full px-4 py-3 text-lg border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          required
        />
      </div>

      {/* Description */}
      <div className="mb-4">
        <label htmlFor="description" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
          説明
        </label>
        <input
          type="text"
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="取引の詳細"
          className="w-full px-4 py-3 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          required
        />
      </div>

      {/* Category (optional) */}
      <div className="mb-6">
        <label htmlFor="category" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
          カテゴリ（任意）
        </label>
        <input
          type="text"
          id="category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          placeholder="給料、食費、など"
          className="w-full px-4 py-3 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-4 rounded-lg transition-colors shadow-md hover:shadow-lg"
      >
        追加
      </button>
    </form>
  );
}
