'use client';

import Link from 'next/link';
import {
  ArrowRight,
  Brain,
  Flame,
  GitBranch,
  History,
  Languages,
  Lock,
} from 'lucide-react';

interface WorkHistory {
  id: string;
  workType: 'fact_emotion' | 'causal_map' | 'translate';
  title: string;
  createdAt: string;
}

interface DashboardProps {
  userName: string;
  streakCount: number;
  recentWorks: WorkHistory[];
}

const workTypeMeta: Record<
  WorkHistory['workType'],
  { label: string; icon: typeof Brain }
> = {
  fact_emotion: {
    label: '事実/感情仕分け',
    icon: Brain,
  },
  causal_map: {
    label: '因果関係マッピング',
    icon: GitBranch,
  },
  translate: {
    label: '小5翻訳チャレンジ',
    icon: Languages,
  },
};

function formatDate(dateString: string) {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return dateString;
  return new Intl.DateTimeFormat('ja-JP', { month: 'numeric', day: 'numeric' }).format(date);
}

export default function Dashboard({ userName, streakCount, recentWorks }: DashboardProps) {
  const displayedWorks = recentWorks.slice(0, 3);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-6 sm:px-6 lg:px-8">
        <header className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">おかえりなさい</p>
              <h1 className="mt-1 text-2xl font-bold text-slate-900">{userName}さん</h1>
            </div>
            <div className="inline-flex w-fit items-center gap-2 rounded-full bg-indigo-50 px-4 py-2 text-indigo-600">
              <Flame className="h-5 w-5" />
              <span className="text-sm font-semibold">{streakCount}日連続</span>
            </div>
          </div>
        </header>

        <section>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Link
              href="/work/fact-emotion"
              className="group rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-0.5 hover:shadow-md hover:ring-indigo-200"
            >
              <div className="flex items-start justify-between">
                <div className="rounded-xl bg-indigo-50 p-3 text-indigo-600">
                  <Brain className="h-6 w-6" />
                </div>
                <span className="rounded-full bg-indigo-600 px-2.5 py-1 text-xs font-semibold text-white">Active</span>
              </div>
              <div className="mt-4">
                <h2 className="text-lg font-semibold text-slate-900">事実/感情仕分け</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">起きたことと感じたことを切り分けて、思考を整理するワークです。</p>
              </div>
              <div className="mt-5 flex items-center gap-2 text-sm font-semibold text-indigo-600">
                はじめる
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
              </div>
            </Link>

            <div className="rounded-2xl bg-slate-100 p-5 text-slate-400 ring-1 ring-slate-200">
              <div className="flex items-start justify-between">
                <div className="rounded-xl bg-slate-200 p-3"><GitBranch className="h-6 w-6" /></div>
                <span className="rounded-full bg-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-500">Coming Soon</span>
              </div>
              <div className="mt-4">
                <h2 className="text-lg font-semibold text-slate-500">因果関係マッピング</h2>
                <p className="mt-2 text-sm leading-6 text-slate-500">出来事のつながりを整理して、考え方のパターンを見つけるワークです。</p>
              </div>
              <div className="mt-5 flex items-center gap-2 text-sm font-semibold"><Lock className="h-4 w-4" />準備中</div>
            </div>

            <div className="rounded-2xl bg-slate-100 p-5 text-slate-400 ring-1 ring-slate-200 sm:col-span-2 lg:col-span-1">
              <div className="flex items-start justify-between">
                <div className="rounded-xl bg-slate-200 p-3"><Languages className="h-6 w-6" /></div>
                <span className="rounded-full bg-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-500">Coming Soon</span>
              </div>
              <div className="mt-4">
                <h2 className="text-lg font-semibold text-slate-500">小5翻訳チャレンジ</h2>
                <p className="mt-2 text-sm leading-6 text-slate-500">むずかしい表現をやさしく言い換える練習に取り組めます。</p>
              </div>
              <div className="mt-5 flex items-center gap-2 text-sm font-semibold"><Lock className="h-4 w-4" />準備中</div>
            </div>
          </div>
        </section>

        <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <History className="h-5 w-5 text-indigo-600" />
              <h2 className="text-lg font-semibold text-slate-900">直近のワーク履歴</h2>
            </div>
            <Link href="/history" className="text-sm font-semibold text-indigo-600 transition hover:text-indigo-700">すべて見る</Link>
          </div>
          <div className="mt-4 space-y-3">
            {displayedWorks.length > 0 ? (
              displayedWorks.map((work) => {
                const meta = workTypeMeta[work.workType];
                const Icon = meta.icon;
                return (
                  <div key={work.id} className="flex items-center gap-3 rounded-xl border border-slate-200 p-4">
                    <div className="rounded-lg bg-indigo-50 p-2 text-indigo-600"><Icon className="h-5 w-5" /></div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-900">{work.title}</p>
                      <p className="mt-1 text-xs text-slate-500">{meta.label} ・ {formatDate(work.createdAt)}</p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="rounded-xl border border-dashed border-slate-300 px-4 py-8 text-center text-sm text-slate-500">まだワーク履歴がありません</div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
