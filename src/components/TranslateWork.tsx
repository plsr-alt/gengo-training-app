"use client";

import { Check, RefreshCw, Save, Star } from "lucide-react";
import { useState } from "react";

export interface TranslateContent {
  term: string;
  answer: string;
  difficulty: string;
  score: number;
  flaggedWords: string[];
}

interface Props {
  onSave: (content: TranslateContent) => void;
  isLoading?: boolean;
}

interface Term {
  word: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  category: string;
}

const TERMS: Term[] = [
  // IT/Business - Beginner (10)
  { word: "サブスクリプション", difficulty: "beginner", category: "IT/ビジネス" },
  { word: "アジェンダ", difficulty: "beginner", category: "IT/ビジネス" },
  { word: "コンセンサス", difficulty: "beginner", category: "IT/ビジネス" },
  { word: "エビデンス", difficulty: "beginner", category: "IT/ビジネス" },
  { word: "スキーム", difficulty: "beginner", category: "IT/ビジネス" },
  { word: "リスクヘッジ", difficulty: "beginner", category: "IT/ビジネス" },
  { word: "ペルソナ", difficulty: "beginner", category: "IT/ビジネス" },
  { word: "KPI", difficulty: "beginner", category: "IT/ビジネス" },
  { word: "PDCA", difficulty: "beginner", category: "IT/ビジネス" },
  { word: "ローンチ", difficulty: "beginner", category: "IT/ビジネス" },
  // Medical/Health - Beginner (10)
  { word: "インフォームドコンセント", difficulty: "beginner", category: "医療/健康" },
  { word: "メンタルヘルス", difficulty: "beginner", category: "医療/健康" },
  { word: "QOL", difficulty: "beginner", category: "医療/健康" },
  { word: "バイタルサイン", difficulty: "beginner", category: "医療/健康" },
  { word: "リハビリテーション", difficulty: "beginner", category: "医療/健康" },
  { word: "セカンドオピニオン", difficulty: "beginner", category: "医療/健康" },
  { word: "ターミナルケア", difficulty: "beginner", category: "医療/健康" },
  { word: "プライマリケア", difficulty: "beginner", category: "医療/健康" },
  { word: "パンデミック", difficulty: "beginner", category: "医療/健康" },
  { word: "エビデンスベースドメディスン", difficulty: "beginner", category: "医療/健康" },
  // Education - Beginner (10)
  { word: "アクティブラーニング", difficulty: "beginner", category: "教育" },
  { word: "STEAM教育", difficulty: "beginner", category: "教育" },
  { word: "リテラシー", difficulty: "beginner", category: "教育" },
  { word: "カリキュラム", difficulty: "beginner", category: "教育" },
  { word: "ファシリテーション", difficulty: "beginner", category: "教育" },
  { word: "ポートフォリオ", difficulty: "beginner", category: "教育" },
  { word: "コンピテンシー", difficulty: "beginner", category: "教育" },
  { word: "インクルーシブ教育", difficulty: "beginner", category: "教育" },
  { word: "ルーブリック", difficulty: "beginner", category: "教育" },
  { word: "ギフテッド教育", difficulty: "beginner", category: "教育" },
  // IT/Business - Intermediate (10)
  { word: "DX", difficulty: "intermediate", category: "IT/ビジネス" },
  { word: "SaaS", difficulty: "intermediate", category: "IT/ビジネス" },
  { word: "アジャイル", difficulty: "intermediate", category: "IT/ビジネス" },
  { word: "MVP", difficulty: "intermediate", category: "IT/ビジネス" },
  { word: "OKR", difficulty: "intermediate", category: "IT/ビジネス" },
  { word: "リテンション", difficulty: "intermediate", category: "IT/ビジネス" },
  { word: "コンバージョン", difficulty: "intermediate", category: "IT/ビジネス" },
  { word: "チャーンレート", difficulty: "intermediate", category: "IT/ビジネス" },
  { word: "PMF", difficulty: "intermediate", category: "IT/ビジネス" },
  { word: "UX", difficulty: "intermediate", category: "IT/ビジネス" },
  // IT/Business - Advanced (10)
  { word: "クォンタム・コンピューティング", difficulty: "advanced", category: "IT/ビジネス" },
  { word: "ブロックチェーン", difficulty: "advanced", category: "IT/ビジネス" },
  { word: "ゼロトラスト", difficulty: "advanced", category: "IT/ビジネス" },
  { word: "マイクロサービス", difficulty: "advanced", category: "IT/ビジネス" },
  { word: "DevOps", difficulty: "advanced", category: "IT/ビジネス" },
  { word: "CI/CD", difficulty: "advanced", category: "IT/ビジネス" },
  { word: "GraphQL", difficulty: "advanced", category: "IT/ビジネス" },
  { word: "コンテナオーケストレーション", difficulty: "advanced", category: "IT/ビジネス" },
  { word: "機械学習", difficulty: "advanced", category: "IT/ビジネス" },
  { word: "自然言語処理", difficulty: "advanced", category: "IT/ビジネス" },
];

// Jargon/katakana patterns to detect in answers
const JARGON_WORDS = TERMS.map((t) => t.word);
const KATAKANA_PATTERN = /[\u30A0-\u30FF]{4,}/g;

const DIFFICULTY_LABEL: Record<string, { label: string; color: string; bg: string }> = {
  beginner: { label: "初級", color: "text-green-700", bg: "bg-green-100" },
  intermediate: { label: "中級", color: "text-yellow-700", bg: "bg-yellow-100" },
  advanced: { label: "上級", color: "text-red-700", bg: "bg-red-100" },
};

const CATEGORY_STYLE: Record<string, { color: string; bg: string }> = {
  "IT/ビジネス": { color: "text-blue-700", bg: "bg-blue-100" },
  "医療/健康": { color: "text-rose-700", bg: "bg-rose-100" },
  "教育": { color: "text-emerald-700", bg: "bg-emerald-100" },
};

function pickRandom(exclude?: string): Term {
  const candidates = exclude ? TERMS.filter((t) => t.word !== exclude) : TERMS;
  return candidates[Math.floor(Math.random() * candidates.length)];
}

function detectFlaggedWords(answer: string): string[] {
  const flagged: string[] = [];
  // Check if any jargon term appears in the answer
  for (const jargon of JARGON_WORDS) {
    if (answer.includes(jargon)) {
      flagged.push(jargon);
    }
  }
  // Check for long katakana words (4+ chars) that might be jargon
  const katakanaMatches = answer.match(KATAKANA_PATTERN) || [];
  for (const match of katakanaMatches) {
    if (!flagged.includes(match)) {
      flagged.push(match);
    }
  }
  return flagged;
}

function calculateScore(answer: string, flagged: string[]): { score: number; breakdown: { noJargon: number; hasExample: number; length: number } } {
  // No jargon used: +40
  const noJargon = flagged.length === 0 ? 40 : Math.max(0, 40 - flagged.length * 15);

  // Has concrete example: +30 (heuristic: contains "例えば", "たとえば", "のように", "みたいな", etc.)
  const examplePatterns = /例えば|たとえば|のように|みたいな|具体的には|実際に|たとえると/;
  const hasExample = examplePatterns.test(answer) ? 30 : 0;

  // Appropriate length: +30 (20-200 chars is ideal)
  const len = answer.trim().length;
  let length = 0;
  if (len >= 20 && len <= 200) {
    length = 30;
  } else if (len >= 10 && len < 20) {
    length = 15;
  } else if (len > 200 && len <= 300) {
    length = 20;
  } else if (len > 0) {
    length = 5;
  }

  return {
    score: noJargon + hasExample + length,
    breakdown: { noJargon, hasExample, length },
  };
}

export default function TranslateWork({ onSave, isLoading = false }: Props) {
  const [currentTerm, setCurrentTerm] = useState<Term>(() => pickRandom());
  const [answer, setAnswer] = useState("");
  const [result, setResult] = useState<{
    score: number;
    flaggedWords: string[];
    breakdown: { noJargon: number; hasExample: number; length: number };
  } | null>(null);
  const [validationError, setValidationError] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  const diffMeta = DIFFICULTY_LABEL[currentTerm.difficulty];
  const catMeta = CATEGORY_STYLE[currentTerm.category] || { color: "text-slate-700", bg: "bg-slate-100" };

  const handleSubmit = () => {
    const trimmed = answer.trim();
    if (!trimmed) {
      setValidationError("説明を入力してください");
      return;
    }
    setValidationError("");
    const flagged = detectFlaggedWords(trimmed);
    const { score, breakdown } = calculateScore(trimmed, flagged);
    setResult({ score, flaggedWords: flagged, breakdown });
  };

  const handleNext = () => {
    setCurrentTerm(pickRandom(currentTerm.word));
    setAnswer("");
    setResult(null);
    setValidationError("");
  };

  const handleSave = () => {
    if (!result) {
      setValidationError("まず「判定する」ボタンで採点してください");
      return;
    }
    setValidationError("");
    setShowSuccess(true);
    setTimeout(() => {
      onSave({
        term: currentTerm.word,
        answer: answer.trim(),
        difficulty: currentTerm.difficulty,
        score: result.score,
        flaggedWords: result.flaggedWords,
      });
    }, 1200);
  };

  const scoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 50) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <section className="mx-auto w-full max-w-4xl rounded-3xl bg-white p-4 shadow-lg ring-1 ring-slate-200 sm:p-6">
      {showSuccess && (
        <div className="fixed inset-x-0 top-4 z-50 flex justify-center">
          <div className="flex items-center gap-2 rounded-xl bg-green-600 px-5 py-3 text-sm font-semibold text-white shadow-lg">
            <Check className="h-4 w-4" />
            保存しました！
          </div>
        </div>
      )}

      <div className="space-y-6">
        {/* Challenge card */}
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-indigo-600">お題</p>
            <div className="flex items-center gap-2">
              <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${catMeta.bg} ${catMeta.color}`}>
                {currentTerm.category}
              </span>
              <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${diffMeta.bg} ${diffMeta.color}`}>
                {diffMeta.label}
              </span>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-center rounded-2xl border border-indigo-200 bg-white p-6">
            <h2 className="text-center text-2xl font-bold text-slate-900">{currentTerm.word}</h2>
          </div>
          <p className="mt-3 text-sm text-slate-500">
            この言葉を、専門用語やカタカナ語を使わずに、小学5年生でもわかるように説明してください。
          </p>
        </div>

        {/* Answer */}
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <label htmlFor="translate-answer" className="block text-lg font-semibold text-slate-900">
            あなたの説明
          </label>
          <p className="mt-1 text-sm text-slate-500">
            具体例を入れると高得点！ カタカナ語や専門用語はなるべく避けましょう。
          </p>
          <textarea
            id="translate-answer"
            value={answer}
            onChange={(e) => { setAnswer(e.target.value); setResult(null); setValidationError(""); }}
            placeholder="例: 毎月決まったお金を払うことで、ずっとサービスを使い続けられる仕組みのこと。例えば、月額で音楽が聴き放題になるサービスがこれにあたります。"
            rows={5}
            aria-required="true"
            className="mt-3 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100"
          />
          <div className="mt-3 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!answer.trim()}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-300"
            >
              <Star className="h-4 w-4" />
              判定する
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="inline-flex items-center gap-2 rounded-xl border border-indigo-200 bg-white px-4 py-2 text-sm font-semibold text-indigo-600 transition hover:bg-indigo-50"
              aria-label="次のお題に進む"
            >
              <RefreshCw className="h-4 w-4" />
              次のお題
            </button>
          </div>
        </div>

        {/* Result */}
        {result && (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <h3 className="text-lg font-semibold text-slate-900">判定結果</h3>
            <div className="mt-3 flex items-center gap-4">
              <div className={`text-4xl font-bold ${scoreColor(result.score)}`}>
                {result.score}<span className="text-lg font-medium text-slate-400">/100</span>
              </div>
            </div>

            {/* Breakdown */}
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between rounded-xl bg-white px-4 py-2 ring-1 ring-slate-200">
                <span className="text-sm text-slate-600">専門用語を使わなかった</span>
                <span className="text-sm font-semibold text-slate-900">+{result.breakdown.noJargon}/40</span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-white px-4 py-2 ring-1 ring-slate-200">
                <span className="text-sm text-slate-600">具体例が含まれている</span>
                <span className="text-sm font-semibold text-slate-900">+{result.breakdown.hasExample}/30</span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-white px-4 py-2 ring-1 ring-slate-200">
                <span className="text-sm text-slate-600">適切な長さ</span>
                <span className="text-sm font-semibold text-slate-900">+{result.breakdown.length}/30</span>
              </div>
            </div>

            {/* Flagged words */}
            {result.flaggedWords.length > 0 && (
              <div className="mt-4 rounded-xl border border-orange-200 bg-orange-50 p-3">
                <p className="text-sm font-semibold text-orange-700">検出された専門用語・カタカナ語:</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {result.flaggedWords.map((word) => (
                    <span key={word} className="rounded-full bg-orange-200 px-3 py-1 text-xs font-medium text-orange-800">
                      {word}
                    </span>
                  ))}
                </div>
                <p className="mt-2 text-xs text-orange-600">
                  これらの言葉を使わずに説明できると、もっと高得点が狙えます！
                </p>
              </div>
            )}

            {result.flaggedWords.length === 0 && result.score >= 80 && (
              <div className="mt-4 rounded-xl border border-green-200 bg-green-50 p-3">
                <p className="text-sm text-green-700">
                  すばらしい！ 専門用語を使わずにわかりやすく説明できています。
                </p>
              </div>
            )}
          </div>
        )}

        {/* Validation error */}
        {validationError && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
            {validationError}
          </div>
        )}

        {/* Save */}
        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleSave}
            disabled={isLoading || showSuccess}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-300"
          >
            <Save className="h-4 w-4" />
            {isLoading ? "保存中..." : "保存する"}
          </button>
        </div>
      </div>
    </section>
  );
}
