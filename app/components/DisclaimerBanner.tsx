"use client"

import { useState, useEffect } from 'react';

export default function DisclaimerBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const hasAcknowledged = localStorage.getItem('okane_disclaimer_acknowledged');
    if (!hasAcknowledged) {
      setIsVisible(true);
    }
  }, []);

  const handleAcknowledge = () => {
    localStorage.setItem('okane_disclaimer_acknowledged', 'true');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-yellow-50 dark:bg-yellow-900 border-t-2 border-yellow-400 dark:border-yellow-600 shadow-lg">
      <div className="container mx-auto px-4 py-4 max-w-6xl">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-yellow-900 dark:text-yellow-100 mb-2 flex items-center gap-2">
              ⚠️ 免責事項とプライバシーについて
            </h3>
            <div className="text-sm text-yellow-800 dark:text-yellow-200 space-y-1">
              <p>
                <strong>免責事項：</strong>本アプリの使用によって生じたいかなる損害についても、作者は一切の責任を負いません。
              </p>
              <p>
                <strong>プライバシー：</strong>本アプリは一切のデータを収集・取得しません。すべてのデータはあなたのブラウザにのみ保存されます。
              </p>
            </div>
          </div>
          <button
            onClick={handleAcknowledge}
            className="shrink-0 px-6 py-2 bg-yellow-600 hover:bg-yellow-700 dark:bg-yellow-700 dark:hover:bg-yellow-600 text-white font-semibold rounded-lg transition-colors shadow-md"
          >
            了解しました
          </button>
        </div>
      </div>
    </div>
  );
}
