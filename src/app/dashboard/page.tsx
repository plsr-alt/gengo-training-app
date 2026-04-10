'use client';

import { useEffect, useState } from 'react';
import Dashboard from '@/components/Dashboard';
import { getWorks, getStats } from '@/lib/storage';

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
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
    <Dashboard
      userName="ゲスト"
      streakCount={stats.streakCount}
      recentWorks={recentWorks}
    />
  );
}
