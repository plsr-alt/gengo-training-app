// MVP用: ローカルストレージベースのデータ永続化
// Supabase導入後にこのファイルを差し替える

export interface FactEmotionContent {
  trigger: string;
  facts: string[];
  emotions: string[];
  assumptions: number[];
}

export interface CausalMapContent {
  theme: string;
  nodes: { id: string; text: string }[];
  edges: { from: string; to: string }[];
}

export interface TranslateContent {
  term: string;
  answer: string;
  difficulty?: string;
  score: number;
  examples?: string[];
  ngWords?: string[];
  flaggedWords: string[];
}

export type WorkContent = FactEmotionContent | CausalMapContent | TranslateContent;

export interface Work {
  id: string;
  workType: 'fact_emotion' | 'causal_map' | 'translate';
  title: string;
  content: WorkContent;
  createdAt: string;
}

export interface UserStats {
  streakCount: number;
  lastWorkDate: string | null;
  totalWorks: number;
}

const WORKS_KEY = 'gengo_works';
const STATS_KEY = 'gengo_stats';
const MAX_WORKS = 200;

function getFromStorage<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function saveToStorage<T>(key: string, value: T): boolean {
  if (typeof window === 'undefined') return false;
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export function getWorks(): Work[] {
  return getFromStorage<Work[]>(WORKS_KEY, []);
}

export function getWork(id: string): Work | undefined {
  return getWorks().find((w) => w.id === id);
}

export function saveWork(work: Omit<Work, 'id' | 'createdAt'>): Work | null {
  const works = getWorks();
  if (works.length >= MAX_WORKS) {
    works.pop();
  }
  const newWork: Work = {
    ...work,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
  works.unshift(newWork);
  const saved = saveToStorage(WORKS_KEY, works);
  if (!saved) return null;
  updateStreak();
  return newWork;
}

export function deleteWork(id: string): void {
  const works = getWorks().filter((w) => w.id !== id);
  saveToStorage(WORKS_KEY, works);
  recalculateStats();
}

export function getStats(): UserStats {
  return getFromStorage<UserStats>(STATS_KEY, {
    streakCount: 0,
    lastWorkDate: null,
    totalWorks: 0,
  });
}

function recalculateStats(): void {
  const works = getWorks();
  if (works.length === 0) {
    saveToStorage(STATS_KEY, { streakCount: 0, lastWorkDate: null, totalWorks: 0 });
    return;
  }

  const dates = [...new Set(works.map((w) => w.createdAt.slice(0, 10)))].sort().reverse();
  let streak = 1;
  for (let i = 1; i < dates.length; i++) {
    const diff = new Date(dates[i - 1]).getTime() - new Date(dates[i]).getTime();
    if (diff <= 86400000) {
      streak++;
    } else {
      break;
    }
  }

  const today = new Date().toISOString().slice(0, 10);
  const lastDate = dates[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  if (lastDate !== today && lastDate !== yesterday) {
    streak = 0;
  }

  saveToStorage(STATS_KEY, { streakCount: streak, lastWorkDate: lastDate, totalWorks: works.length });
}

function updateStreak(): void {
  recalculateStats();
}

export function getStorageUsage(): { used: number; limit: number; percentage: number } {
  if (typeof window === 'undefined') return { used: 0, limit: 5 * 1024 * 1024, percentage: 0 };
  let used = 0;
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key) {
      used += (localStorage.getItem(key) || '').length * 2;
    }
  }
  const limit = 5 * 1024 * 1024;
  return { used, limit, percentage: Math.round((used / limit) * 100) };
}
