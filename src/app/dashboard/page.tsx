'use client';

import { useEffect, useState } from 'react';
import Dashboard from '@/components/Dashboard';
import Onboarding from '@/components/Onboarding';
import { getWorks, getStats } from '@/lib/storage';
import Link from 'next/link';
import { ArrowRight, Brain, GitBranch, Languages, Sparkles } from 'lucide-react';

const ONBOARDED_KEY = 'gengo_onboarded';

type WorkType = 'fact_emotion' | 'causal_map' | 'translate';

function RecommendedAction({ completedTypes }: { completedTypes: Set<WorkType> }) {
  const hasFE = completedTypes.has('fact_emotion');
  const hasCM = completedTypes.has('causal_map');
  const hasTR = completedTypes.has('translate');

  if (!hasFE && !hasCM && !hasTR) {
    return (
      <div className="rounded-2xl border-2 border-indigo-200 bg-indigo-50 p-5">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-indigo-600" />
          <h3 className="text-lg font-bold text-indigo-900">最初のワークを始めよう！</h3>
        </div>
        <p className="mt-2 text-sm text-indigo-700">
          まずは「事実/感情仕分け」から。日常の出来事を事実と感情に分けるだけで、思考がクリアになります。
        </p>
        <Link
          href="/work/fact-emotion"
          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
        >
          <Brain className="h-4 w-4" />
          事実/感情仕分けを始める
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  if (hasFE && !hasCM) {
    return (
      <div className="rounded-2xl border-2 border-indigo-200 bg-indigo-50 p-5">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-indigo-600" />
          <h3 className="text-lg font-bold text-indigo-900">次のステップへ！</h3>
        </div>
        <p className="mt-2 text-sm text-indigo-700">
          事実/感情仕分けをクリアしました。次は「因果関係マッピング」で、出来事のつながりを可視化してみましょう。
        </p>
        <Link
          href="/work/causal-map"
          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
        >
          <GitBranch className="h-4 w-4" />
          因果関係マッピングを始める
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  if (hasFE && hasCM && !hasTR) {
    return (
      <div className="rounded-2xl border-2 border-indigo-200 bg-indigo-50 p-5">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-indigo-600" />
          <h3 className="text-lg font-bold text-indigo-900">あと1つ！</h3>
        </div>
        <p className="mt-2 text-sm text-indigo-700">
          2つのワークを達成しました。最後は「小5翻訳チャレンジ」で、むずかしい言葉をやさしく言い換える力を鍛えましょう。
        </p>
        <Link
          href="/work/translate"
          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
        >
          <Languages className="h-4 w-4" />
          小5翻訳チャレンジを始める
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  // All 3 completed - random suggestion
  const suggestions = [
    { href: '/work/fact-emotion', label: '事実/感情仕分け', icon: Brain },
    { href: '/work/causal-map', label: '因果関係マッピング', icon: GitBranch },
    { href: '/work/translate', label: '小5翻訳チャレンジ', icon: Languages },
  ];
  const pick = suggestions[Math.floor(Math.random() * suggestions.length)];
  const Icon = pick.icon;

  return (
    <div className="rounded-2xl border-2 border-indigo-200 bg-indigo-50 p-5">
      <div className="flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-indigo-600" />
        <h3 className="text-lg font-bold text-indigo-900">今日のワーク</h3>
      </div>
      <p className="mt-2 text-sm text-indigo-700">
        全ワークを体験済み！ 繰り返すほど力になります。今日はこちらをどうぞ。
      </p>
      <Link
        href={pick.href}
        className="mt-4 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
      >
        <Icon className="h-4 w-4" />
        {pick.label}を始める
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      const onboarded = localStorage.getItem(ONBOARDED_KEY);
      if (!onboarded) {
        setShowOnboarding(true);
      }
    }
  }, []);

  if (!mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-slate-400">読み込み中...</div>
      </div>
    );
  }

  const works = getWorks();
  const stats = getStats();

  const completedTypes = new Set(works.map((w) => w.workType)) as Set<WorkType>;

  const recentWorks = works.slice(0, 3).map((w) => ({
    id: w.id,
    workType: w.workType,
    title: w.title,
    createdAt: w.createdAt,
  }));

  return (
    <>
      {showOnboarding && (
        <Onboarding onComplete={() => setShowOnboarding(false)} />
      )}
      <div className="min-h-screen bg-slate-50">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-6 sm:px-6 lg:px-8">
          <RecommendedAction completedTypes={completedTypes} />
        </div>
      </div>
      <Dashboard
        userName="ゲスト"
        streakCount={stats.streakCount}
        recentWorks={recentWorks}
      />
    </>
  );
}
