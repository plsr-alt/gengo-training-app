'use client';

import { useState } from 'react';
import { ArrowLeft, CheckCircle, Share2, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import FactEmotionWork from '@/components/FactEmotionWork';
import type { FactEmotionContent } from '@/components/FactEmotionWork';
import { saveWork } from '@/lib/storage';

export default function FactEmotionPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [completed, setCompleted] = useState(false);
  const [savedTitle, setSavedTitle] = useState('');

  const handleSave = (content: FactEmotionContent) => {
    setIsLoading(true);
    setError('');
    try {
      const title = content.trigger.slice(0, 50) || '無題のワーク';
      const result = saveWork({
        workType: 'fact_emotion',
        title,
        content,
      });
      if (!result) {
        setError('保存に失敗しました。ブラウザのストレージ容量が不足している可能性があります。');
        setIsLoading(false);
        return;
      }
      setSavedTitle(title);
      setCompleted(true);
      setIsLoading(false);
    } catch {
      setError('保存中にエラーが発生しました。もう一度お試しください。');
      setIsLoading(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: '言語化トレーニング',
        text: '事実/感情仕分けワークを完了しました！',
        url: window.location.origin,
      });
    } else {
      await navigator.clipboard.writeText(
        `事実/感情仕分けワークを完了しました！ ${window.location.origin}`
      );
      alert('クリップボードにコピーしました');
    }
  };

  if (completed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="w-full max-w-md text-center">
          <div className="rounded-3xl bg-white p-8 shadow-lg ring-1 ring-slate-200">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="mt-5 text-2xl font-bold text-slate-900">ワーク完了！</h2>
            <p className="mt-2 text-sm text-slate-600">
              事実と感情を切り分ける力が一歩前進しました。
            </p>
            <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-left">
              <p className="text-xs font-medium text-slate-500">保存したワーク</p>
              <p className="mt-1 truncate text-sm font-semibold text-slate-900">{savedTitle}</p>
              <p className="mt-1 text-xs text-slate-400">事実/感情仕分け</p>
            </div>
            <div className="mt-6 space-y-3">
              <Link
                href="/work/causal-map"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
              >
                次のワークへ
                <ArrowRight className="h-4 w-4" />
              </Link>
              <button
                type="button"
                onClick={handleShare}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-indigo-200 bg-white px-5 py-3 text-sm font-semibold text-indigo-600 transition hover:bg-indigo-50"
              >
                <Share2 className="h-4 w-4" />
                シェアする
              </button>
              <Link
                href="/dashboard"
                className="block text-sm font-medium text-slate-500 transition hover:text-indigo-600"
              >
                ダッシュボードに戻る
              </Link>
            </div>
          </div>
        </div>
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
        <h1 className="mb-6 text-2xl font-bold text-slate-900">事実/感情仕分けワーク</h1>
        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
            {error}
          </div>
        )}
        <FactEmotionWork onSave={handleSave} isLoading={isLoading} />
      </div>
    </div>
  );
}
