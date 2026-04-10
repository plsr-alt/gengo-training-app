// MVP用: ローカルストレージベースのデータ永続化
// Supabase導入後にこのファイルを差し替える

export interface FactEmotionContent {
  trigger: string;
  facts: string[];
  emotions: string[];
  assumptions: number[];
}

export interface Work {
  id: string;
  workType: 'fact_emotion' | 'causal_map' | 'translate';
  title: string;
  content: FactEmotionContent;
  createdAt: string;
}

export interface UserStats {
  streakCount: number;
  lastWorkDate: string | null;
  totalWorks: number;
}

const WORKS_KEY = 'gengo_works';
const STATS_KEY = 'gengo_stats';

function getFromStorage<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function saveToStorage<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(value));
}

export function getWorks(): Work[] {
  return getFromStorage<Work[]>(WORKS_KEY, []);
}

export function getWork(id: string): Work | undefined {
  return getWorks().find((w) => w.id === id);
}

export function saveWork(work: Omit<Work, 'id' | 'createdAt'>): Work {
  const works = getWorks();
  const newWork: Work = {
    ...work,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
  works.unshift(newWork);
  saveToStorage(WORKS_KEY, works);
  updateStreak();
  return newWork;
}

export function deleteWork(id: string): void {
  const works = getWorks().filter((w) => w.id !== id);
  saveToStorage(WORKS_KEY, works);
}

export function getStats(): UserStats {
  return getFromStorage<UserStats>(STATS_KEY, {
    streakCount: 0,
    lastWorkDate: null,
    totalWorks: 0,
  });
}

function updateStreak(): void {
  const works = getWorks();
  const stats = getStats();
  const today = new Date().toISOString().slice(0, 10);

  if (stats.lastWorkDate === today) {
    stats.totalWorks = works.length;
    saveToStorage(STATS_KEY, stats);
    return;
  }

  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  if (stats.lastWorkDate === yesterday) {
    stats.streakCount += 1;
  } else {
    stats.streakCount = 1;
  }
  stats.lastWorkDate = today;
  stats.totalWorks = works.length;
  saveToStorage(STATS_KEY, stats);
}
