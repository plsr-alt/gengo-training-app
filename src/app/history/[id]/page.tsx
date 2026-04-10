'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, AlertTriangle } from 'lucide-react';
import { getWork, type Work, type FactEmotionContent, type CausalMapContent, type TranslateContent } from '@/lib/storage';

export default function WorkDetailPage() {
  const params = useParams();
  const [work, setWork] = useState<Work | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const id = params.id as string;
    const found = getWork(id);
    setWork(found ?? null);
  }, [params.id]);

  if (!mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-slate-400">読み込み中...</div>
      </div>
    );
  }

  if (!work) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50">
        <p className="text-slate-500">ワークが見つかりません</p>
        <Link href="/history" className="mt-4 text-indigo-600 hover:underline">履歴に戻る</Link>
      </div>
    );
  }

  const renderFactEmotion = (content: FactEmotionContent) => (
    <>
      <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
        <h2 className="text-sm font-semibold text-indigo-600">心が動いた出来事</h2>
        <p className="mt-2 text-slate-700 whitespace-pre-wrap">{content.trigger}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <h2 className="text-sm font-semibold text-indigo-600">事実</h2>
          <ul className="mt-3 space-y-2">
            {content.facts.map((fact, i) => (
              <li key={i} className="text-sm text-slate-700">• {fact}</li>
            ))}
            {content.facts.length === 0 && <li className="text-sm text-slate-400">なし</li>}
          </ul>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <h2 className="text-sm font-semibold text-indigo-600">感情</h2>
          <ul className="mt-3 space-y-2">
            {content.emotions.map((emotion, i) => {
              const isAssumption = content.assumptions.includes(i);
              return (
                <li key={i} className={`flex items-start gap-2 text-sm ${isAssumption ? 'text-orange-700' : 'text-slate-700'}`}>
                  {isAssumption && <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-orange-500" />}
                  <span>• {emotion}</span>
                </li>
              );
            })}
            {content.emotions.length === 0 && <li className="text-sm text-slate-400">なし</li>}
          </ul>
        </div>
      </div>

      {content.assumptions.length > 0 && (
        <div className="rounded-2xl border border-orange-200 bg-orange-50 p-4">
          <p className="text-sm font-semibold text-orange-700">
            思い込みの可能性がある項目: {content.assumptions.length}件
          </p>
          <p className="mt-1 text-sm text-orange-600">
            オレンジ色の項目は、事実と混同している可能性があります。もう一度振り返ってみましょう。
          </p>
        </div>
      )}
    </>
  );

  const renderCausalMap = (content: CausalMapContent) => (
    <>
      <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
        <h2 className="text-sm font-semibold text-indigo-600">テーマ</h2>
        <p className="mt-2 text-slate-700 whitespace-pre-wrap">{content.theme}</p>
      </div>
      <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
        <h2 className="text-sm font-semibold text-indigo-600">ノード ({content.nodes.length}件)</h2>
        <ul className="mt-3 space-y-2">
          {content.nodes.map((node) => (
            <li key={node.id} className="text-sm text-slate-700">• {node.text}</li>
          ))}
        </ul>
      </div>
    </>
  );

  const renderTranslate = (content: TranslateContent) => (
    <>
      <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
        <h2 className="text-sm font-semibold text-indigo-600">お題</h2>
        <p className="mt-2 text-lg font-bold text-slate-900">{content.term}</p>
        <p className="mt-1 text-sm text-slate-500">難易度: {content.difficulty}</p>
      </div>
      <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
        <h2 className="text-sm font-semibold text-indigo-600">あなたの説明</h2>
        <p className="mt-2 text-slate-700 whitespace-pre-wrap">{content.answer}</p>
      </div>
      <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
        <h2 className="text-sm font-semibold text-indigo-600">スコア</h2>
        <p className="mt-2 text-2xl font-bold text-slate-900">{content.score}<span className="text-sm text-slate-400">/100</span></p>
        {content.flaggedWords.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {content.flaggedWords.map((w) => (
              <span key={w} className="rounded-full bg-orange-100 px-3 py-1 text-xs font-medium text-orange-700">{w}</span>
            ))}
          </div>
        )}
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-slate-50 py-6">
      <div className="mx-auto max-w-4xl px-4">
        <Link
          href="/history"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-indigo-600"
        >
          <ArrowLeft className="h-4 w-4" />
          履歴に戻る
        </Link>

        <h1 className="mb-2 text-2xl font-bold text-slate-900">{work.title}</h1>
        <p className="mb-6 text-sm text-slate-500">
          {new Intl.DateTimeFormat('ja-JP', { year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(work.createdAt))}
        </p>

        <div className="space-y-6">
          {work.workType === 'fact_emotion' && renderFactEmotion(work.content as FactEmotionContent)}
          {work.workType === 'causal_map' && renderCausalMap(work.content as CausalMapContent)}
          {work.workType === 'translate' && renderTranslate(work.content as TranslateContent)}
        </div>
      </div>
    </div>
  );
}
