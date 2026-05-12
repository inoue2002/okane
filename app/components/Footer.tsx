"use client"

import { useState } from 'react';

export default function Footer() {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <footer className="mt-12 pt-8 pb-6 border-t border-zinc-200 dark:border-zinc-800">
        <div className="text-center text-sm text-zinc-600 dark:text-zinc-400 space-y-2">
          <p>
            本アプリは一切のデータを収集しません。すべてのデータはあなたのブラウザにのみ保存されます。
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <button
              onClick={() => setShowModal(true)}
              className="underline hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors"
            >
              免責事項とプライバシーポリシー
            </button>
            <a
              href="https://github.com/inoue2002/okane"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors"
            >
              GitHub
            </a>
          </div>
          <p>
            <a
              href="https://github.com/inoue2002/okane-skills"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors"
            >
              okane-skills
            </a>
            {' '}を使えば、お好きなAIエージェントに修正を依頼できます
          </p>
          <p className="text-xs text-zinc-500 dark:text-zinc-500">
            Built with Next.js 16 + React 19 + Tailwind CSS v4
          </p>
        </div>
      </footer>

      {/* Modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-white dark:bg-zinc-900 rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">
                ⚠️ 免責事項とプライバシーポリシー
              </h2>

              <div className="space-y-6 text-zinc-700 dark:text-zinc-300">
                {/* 免責事項 */}
                <section>
                  <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-2">
                    免責事項
                  </h3>
                  <div className="space-y-2 text-sm">
                    <p>
                      <strong>本ソフトウェアは「現状のまま」提供され、いかなる保証もありません。</strong>
                    </p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      <li>
                        本ソフトウェアの使用によって生じた<strong>損害、データの喪失、金銭的損失</strong>、
                        その他の問題について、作者および貢献者は<strong>一切の責任を負いません</strong>。
                      </li>
                      <li>
                        本ソフトウェアは教育目的および個人的な財務管理の補助ツールとして提供されています。
                      </li>
                      <li>
                        <strong>重要な財務上の判断を行う際は、必ず専門家に相談してください。</strong>
                      </li>
                      <li>
                        データの正確性や完全性について保証はありません。ユーザー自身の責任でご使用ください。
                      </li>
                    </ul>
                  </div>
                </section>

                {/* プライバシーポリシー */}
                <section>
                  <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-2">
                    プライバシーポリシー
                  </h3>
                  <div className="space-y-2 text-sm">
                    <p>
                      <strong>このアプリケーションは一切のデータを収集・取得しません。</strong>
                    </p>
                    <ul className="list-none space-y-1">
                      <li>✅ ユーザーデータを収集しません</li>
                      <li>✅ 外部サーバーにデータを送信しません</li>
                      <li>✅ 追跡やアナリティクスを行いません</li>
                      <li>✅ すべてのデータはブラウザのローカルストレージのみに保存されます</li>
                      <li>✅ データはユーザー自身のみがアクセス可能です</li>
                      <li>✅ 第三者とデータを共有しません</li>
                    </ul>
                    <p className="mt-2">
                      このアプリケーションは完全にクライアントサイドで動作し、オフラインでも使用可能です（初回ロード後）。
                    </p>
                  </div>
                </section>

                {/* データの保存について */}
                <section>
                  <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-2">
                    データの保存について
                  </h3>
                  <div className="space-y-2 text-sm">
                    <p>入力されたすべてのデータは：</p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      <li>ブラウザのlocalStorageにのみ保存されます</li>
                      <li>あなたのデバイスから外部に送信されることは一切ありません</li>
                      <li>ブラウザのキャッシュをクリアすると削除されます</li>
                      <li>定期的にエクスポート機能でバックアップすることを推奨します</li>
                    </ul>
                  </div>
                </section>

                {/* ライセンス */}
                <section>
                  <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-2">
                    ライセンス
                  </h3>
                  <p className="text-sm">
                    本ソフトウェアはMITライセンスの下で公開されています。
                  </p>
                </section>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
                >
                  閉じる
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
