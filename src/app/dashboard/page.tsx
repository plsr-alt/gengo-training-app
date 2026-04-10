'use client';

import { useEffect, useState } from 'react';
import Dashboard from '@/components/Dashboard';
import Onboarding from '@/components/Onboarding';
import { getWorks, getStats } from '@/lib/storage';

const ONBOARDED_KEY = 'gengo_onboarded';

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
      <Dashboard
        userName="ゲスト"
        streakCount={stats.streakCount}
        recentWorks={recentWorks}
      />
    </>
  );
}
