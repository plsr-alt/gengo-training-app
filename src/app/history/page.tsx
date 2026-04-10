'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Brain, Trash2 } from 'lucide-react';
import { getWorks, deleteWork, type Work } from '@/lib/storage';

function formatDate(dateString: string) {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return dateString;
  return new Intl.DateTimeFormat('ja-JP', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export default function HistoryPage() {
  const [works, setWorks] = useState<Work[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setWorks(getWorks());
  }, []);

  const handleDelete = (id: string) => {
    if (!window.confirm('このワークを削除しますか? この操作は取り消せません。')) return;
    deleteWork(id);
    setWorks(getWorks());
  };

  if (!mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-slate-400">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-6">
      <div className="mx-auto max-w-4xl px-4">
        <Link
          href="/dashboard"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-indigo-600"
        >
          <ArrowLeft className="h-4 w-4" />
          ダッシュボードに戻る
        </Link>
        <h1 className="mb-6 text-2xl font-bold text-slate-900">ワーク履歴</h1>

        {works.length === 0 ? (
          <div className="rounded-2xl bg-white p-12 text-center shadow-sm ring-1 ring-slate-200">
            <p className="text-slate-500">まだワーク履歴がありません</p>
            <Link
              href="/work/fact-emotion"
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
            >
              最初のワークを始める
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {works.map((work) => (
              <div
                key={work.id}
                className="flex items-center gap-4 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200"
              >
                <div className="rounded-xl bg-indigo-50 p-3 text-indigo-600">
                  <Brain className="h-5 w-5" />
                </div>
                <Link href={`/history/${work.id}`} className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-slate-900">{work.title}</p>
                  <p className="mt-1 text-xs text-slate-500">{formatDate(work.createdAt)}</p>
                </Link>
                <button
                  type="button"
                  onClick={() => handleDelete(work.id)}
                  className="shrink-0 rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-red-500"
                  aria-label="削除"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
