'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import FactEmotionWork from '@/components/FactEmotionWork';
import type { FactEmotionContent } from '@/components/FactEmotionWork';
import { saveWork } from '@/lib/storage';

export default function FactEmotionPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = (content: FactEmotionContent) => {
    setIsLoading(true);
    try {
      saveWork({
        workType: 'fact_emotion',
        title: content.trigger.slice(0, 50) || '無題のワーク',
        content,
      });
      router.push('/dashboard');
    } finally {
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
        <h1 className="mb-6 text-2xl font-bold text-slate-900">事実/感情仕分けワーク</h1>
        <FactEmotionWork onSave={handleSave} isLoading={isLoading} />
      </div>
    </div>
  );
}
