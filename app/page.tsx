"use client"

import { useState, useEffect } from 'react';
import TransactionForm from './components/TransactionForm';
import BalanceTimeline from './components/BalanceTimeline';
import BalanceSummary from './components/BalanceSummary';
import BalanceChart from './components/BalanceChart';
import MonthlySummary from './components/MonthlySummary';
import RecurringTemplates from './components/RecurringTemplates';
import DataManager from './components/DataManager';
import DisclaimerBanner from './components/DisclaimerBanner';
import Footer from './components/Footer';
import Modal from './components/Modal';
import { Transaction } from '@/lib/types';
import { calculateDailyBalances } from '@/lib/utils';
import {
  loadTransactions,
  saveTransactions,
  loadInitialBalance,
  saveInitialBalance,
  clearAllData,
} from '@/lib/storage';

export default function Home() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [initialBalance, setInitialBalance] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Load data from localStorage on mount
  useEffect(() => {
    const loadedTransactions = loadTransactions();
    const loadedBalance = loadInitialBalance();
    setTransactions(loadedTransactions);
    setInitialBalance(loadedBalance);
    setIsLoaded(true);
  }, []);

  // Save transactions when they change
  useEffect(() => {
    if (isLoaded) {
      saveTransactions(transactions);
    }
  }, [transactions, isLoaded]);

  const handleAddTransaction = (transaction: Transaction) => {
    setTransactions(prev => [...prev, transaction]);
  };

  const handleAddTransactionFromModal = (transaction: Transaction) => {
    handleAddTransaction(transaction);
    setIsAddModalOpen(false);
  };

  const handleDeleteTransaction = (id: string) => {
    if (confirm('この取引を削除しますか？')) {
      setTransactions(prev => prev.filter(t => t.id !== id));
    }
  };

  const handleUpdateTransactionDate = (id: string, newDate: string) => {
    setTransactions(prev =>
      prev.map(t => t.id === id ? { ...t, date: newDate } : t)
    );
  };

  const handleUpdateTransactionAmount = (id: string, newAmount: number) => {
    setTransactions(prev =>
      prev.map(t => t.id === id ? { ...t, amount: newAmount } : t)
    );
  };

  const handleClearAll = () => {
    if (confirm('すべてのデータを削除しますか？この操作は取り消せません。')) {
      clearAllData();
      setTransactions([]);
      setInitialBalance(0);
    }
  };

  const handleImport = (importedTransactions: Transaction[], importedBalance: number) => {
    setTransactions(importedTransactions);
    setInitialBalance(importedBalance);
    saveTransactions(importedTransactions);
    saveInitialBalance(importedBalance);
  };

  // Calculate daily balances
  const dailyBalances = calculateDailyBalances(transactions, initialBalance);

  const currentYear = new Date().getFullYear();
  const todayString = new Date().toISOString().split('T')[0];

  const yearIncome = transactions
    .filter(t => t.type === 'income' && t.date.startsWith(`${currentYear}-`))
    .reduce((sum, t) => sum + t.amount, 0);

  const yearExpense = transactions
    .filter(t => t.type === 'expense' && t.date.startsWith(`${currentYear}-`))
    .reduce((sum, t) => sum + t.amount, 0);

  const todayBalance = transactions
    .filter(t => t.date <= todayString)
    .reduce(
      (sum, t) => sum + (t.type === 'income' ? t.amount : -t.amount),
      initialBalance
    );

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center">
        <div className="text-zinc-600 dark:text-zinc-400">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-50">
            お金シミュレーター
          </h1>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-md hover:shadow-lg transition-all"
            >
              ＋ 取引追加
            </button>
            <DataManager
              transactions={transactions}
              initialBalance={initialBalance}
              onImport={handleImport}
              onClearAll={handleClearAll}
            />
          </div>
        </div>

        <BalanceSummary
          year={currentYear}
          todayBalance={todayBalance}
          yearIncome={yearIncome}
          yearExpense={yearExpense}
        />

        <BalanceChart
          dailyBalances={dailyBalances}
          initialBalance={initialBalance}
        />

        <MonthlySummary transactions={transactions} />

        <RecurringTemplates
          transactions={transactions}
          onAddTransaction={handleAddTransaction}
        />

        <BalanceTimeline
          dailyBalances={dailyBalances}
          onDeleteTransaction={handleDeleteTransaction}
          onUpdateTransactionDate={handleUpdateTransactionDate}
          onUpdateTransactionAmount={handleUpdateTransactionAmount}
        />

        <Footer />
      </div>

      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="取引を追加"
      >
        <TransactionForm onAddTransaction={handleAddTransactionFromModal} />
      </Modal>

      <DisclaimerBanner />
    </div>
  );
}
