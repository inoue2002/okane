import { Transaction } from './types';

export interface ExportData {
  version: string;
  exportDate: string;
  initialBalance: number;
  transactions: Transaction[];
}

export function exportToJSON(transactions: Transaction[], initialBalance: number): string {
  const data: ExportData = {
    version: '1.0',
    exportDate: new Date().toISOString(),
    initialBalance,
    transactions,
  };

  return JSON.stringify(data, null, 2);
}

export function downloadJSON(transactions: Transaction[], initialBalance: number): void {
  const json = exportToJSON(transactions, initialBalance);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `okane-backup-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function parseImportedJSON(jsonString: string): ExportData | null {
  try {
    const data = JSON.parse(jsonString);

    // Validate structure
    if (!data.version || !data.transactions || typeof data.initialBalance !== 'number') {
      throw new Error('Invalid data structure');
    }

    // Validate transactions
    if (!Array.isArray(data.transactions)) {
      throw new Error('Transactions must be an array');
    }

    for (const transaction of data.transactions) {
      if (!transaction.id || !transaction.date || !transaction.type ||
          typeof transaction.amount !== 'number' || !transaction.description) {
        throw new Error('Invalid transaction structure');
      }
    }

    return data as ExportData;
  } catch (error) {
    console.error('Failed to parse JSON:', error);
    return null;
  }
}
