'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import TranslateWork from '@/components/TranslateWork';
import type { TranslateContent } from '@/components/TranslateWork';
import { saveWork } from '@/lib/storage';

export default function TranslatePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSave = (content: TranslateContent) => {
    setIsLoading(true);
    setError('');
    try {
      const result = saveWork({
        workType: 'translate',
        title: `${content.term}（${content.score}点）`,
        content,
      });
      if (!result) {
        setError('保存に失敗しました。ブラウザのストレージ容量が不足している可能性があります。');
        setIsLoading(false);
        return;
      }
      setTimeout(() => router.push('/dashboard'), 1500);
    } catch {
      setError('保存中にエラーが発生しました。もう一度お試しください。');
      setIsLoading(false);
    }
  };

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
        <h1 className="mb-6 text-2xl font-bold text-slate-900">やさしい言葉チャレンジ</h1>
        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
            {error}
          </div>
        )}
        <TranslateWork onSave={handleSave} isLoading={isLoading} />
      </div>
    </div>
  );
}
