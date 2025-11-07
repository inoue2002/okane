"use client"

import { useRef } from 'react';
import { Transaction } from '@/lib/types';
import { downloadJSON, parseImportedJSON } from '@/lib/export';

interface DataManagerProps {
  transactions: Transaction[];
  initialBalance: number;
  onImport: (transactions: Transaction[], initialBalance: number) => void;
  onClearAll: () => void;
}

export default function DataManager({ transactions, initialBalance, onImport, onClearAll }: DataManagerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    downloadJSON(transactions, initialBalance);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const data = parseImportedJSON(content);

      if (data) {
        if (confirm(`${data.transactions.length}件の取引をインポートしますか？\n現在のデータは上書きされます。`)) {
          onImport(data.transactions, data.initialBalance);
          alert('インポートが完了しました！');
        }
      } else {
        alert('無効なファイル形式です。正しいJSONファイルを選択してください。');
      }
    };

    reader.readAsText(file);
    // Reset input so the same file can be selected again
    e.target.value = '';
  };

  return (
    <div className="flex gap-2">
      {/* Export Button */}
      <button
        onClick={handleExport}
        className="px-4 py-2 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 border border-blue-300 dark:border-blue-700 rounded-md hover:bg-blue-50 dark:hover:bg-blue-950 transition-colors"
        title="データをJSONファイルとしてダウンロード"
      >
        📥 エクスポート
      </button>

      {/* Import Button */}
      <button
        onClick={handleImportClick}
        className="px-4 py-2 text-sm text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 border border-green-300 dark:border-green-700 rounded-md hover:bg-green-50 dark:hover:bg-green-950 transition-colors"
        title="JSONファイルからデータをインポート"
      >
        📤 インポート
      </button>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json,application/json"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Clear All Button */}
      {transactions.length > 0 && (
        <button
          onClick={onClearAll}
          className="px-4 py-2 text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 border border-red-300 dark:border-red-700 rounded-md hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
          title="すべてのデータを削除"
        >
          🗑️ すべてクリア
        </button>
      )}
    </div>
  );
}
