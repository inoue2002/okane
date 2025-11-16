"use client"

import { useState, useEffect } from 'react';
import TransactionForm from './components/TransactionForm';
import BalanceTimeline from './components/BalanceTimeline';
import BalanceSummary from './components/BalanceSummary';
import BalanceChart from './components/BalanceChart';
import DataManager from './components/DataManager';
import DisclaimerBanner from './components/DisclaimerBanner';
import Footer from './components/Footer';
import { Transaction } from '@/lib/types';
import { calculateDailyBalances } from '@/lib/utils';
import { loadTransactions, saveTransactions, loadInitialBalance, saveInitialBalance, clearAllData } from '@/lib/storage';

export default function Home() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [initialBalance, setInitialBalance] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

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

  const handleUpdateInitialBalance = (balance: number) => {
    setInitialBalance(balance);
    saveInitialBalance(balance);
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

  // Calculate totals
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const currentBalance = initialBalance + totalIncome - totalExpense;

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
          <DataManager
            transactions={transactions}
            initialBalance={initialBalance}
            onImport={handleImport}
            onClearAll={handleClearAll}
          />
        </div>

        <BalanceSummary
          initialBalance={initialBalance}
          onUpdateInitialBalance={handleUpdateInitialBalance}
          currentBalance={currentBalance}
          totalIncome={totalIncome}
          totalExpense={totalExpense}
        />

        <BalanceChart
          dailyBalances={dailyBalances}
          initialBalance={initialBalance}
        />

        <TransactionForm onAddTransaction={handleAddTransaction} />

        <BalanceTimeline
          dailyBalances={dailyBalances}
          onDeleteTransaction={handleDeleteTransaction}
          onUpdateTransactionDate={handleUpdateTransactionDate}
        />

        <Footer />
      </div>

      <DisclaimerBanner />
    </div>
  );
}
