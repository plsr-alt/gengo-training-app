'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Lightbulb,
  Mic,
  MicOff,
  Save,
  Sparkles,
  Volume2,
} from 'lucide-react';
import { translateChallenges, type Challenge } from '@/lib/challenges';
import { saveWork, type TranslateContent } from '@/lib/storage';

type Category = Challenge['category'];
type Difficulty = Challenge['difficulty'];

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
}

declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognition;
    webkitSpeechRecognition?: new () => SpeechRecognition;
  }
}

interface EvaluationResult {
  score: number;
  matchedKeywords: string[];
  missingKeywords: string[];
  detectedNgWords: string[];
  katakanaWords: string[];
  lengthPenalty: boolean;
  simplicityBonus: number;
  cappedAtThirty: boolean;
  isZeroScore: boolean;
  feedback: string;
}

const MAX_LENGTH = 80;
const LONG_TEXT_THRESHOLD = 55;
const HIRAGANA_PATTERN = /[ぁ-ん]/g;
const JAPANESE_PATTERN = /[ぁ-んァ-ヶー一-龠]/g;
const KATAKANA_WORD_PATTERN = /^[ァ-ヶー]+$/;
const KATAKANA_TOKEN_PATTERN = /[ァ-ヶー]{3,}|[A-Za-z0-9]+(?:-[A-Za-z0-9]+)*/g;
const allowedKatakana = new Set([
  'エラー',
  'モード',
  'ルール',
  'テスト',
  'データ',
  'サイト',
  'ページ',
  'リスト',
  'メモ',
  'メール',
  'アプリ',
  'ボタン',
  'タイプ',
  'コード',
]);

const categoryMeta: Record<Category, { label: string; className: string }> = {
  it: {
    label: 'IT',
    className: 'bg-sky-100 text-sky-700 ring-sky-200',
  },
  business: {
    label: 'ビジネス',
    className: 'bg-indigo-100 text-indigo-700 ring-indigo-200',
  },
  medical: {
    label: '医療',
    className: 'bg-rose-100 text-rose-700 ring-rose-200',
  },
  daily: {
    label: '日常',
    className: 'bg-emerald-100 text-emerald-700 ring-emerald-200',
  },
};

const difficultyMeta: Record<Difficulty, { label: string; className: string }> = {
  beginner: {
    label: '初級',
    className: 'bg-emerald-500 text-white',
  },
  intermediate: {
    label: '中級',
    className: 'bg-amber-500 text-white',
  },
  advanced: {
    label: '上級',
    className: 'bg-fuchsia-600 text-white',
  },
};

function normalizeText(text: string) {
  return text.replace(/\s+/g, '').toLowerCase();
}

function escapeRegExp(text: string) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function uniq(values: string[]) {
  return Array.from(new Set(values));
}

function getCharKind(char: string | undefined) {
  if (!char) {
    return 'boundary';
  }

  if (/\p{Script=Han}/u.test(char)) {
    return 'kanji';
  }

  if (/\p{Script=Hiragana}/u.test(char)) {
    return 'hiragana';
  }

  if (/\p{Script=Katakana}/u.test(char)) {
    return 'katakana';
  }

  if (/[A-Za-z]/.test(char)) {
    return 'latin';
  }

  if (/[0-9]/.test(char)) {
    return 'digit';
  }

  return 'boundary';
}

function hasKeywordBoundary(text: string, start: number, end: number, word: string) {
  const previousChar = text[start - 1];
  const nextChar = text[end];
  const firstKind = getCharKind(word[0]);
  const lastKind = getCharKind(text[end - 1] ?? word[word.length - 1]);
  const previousKind = getCharKind(previousChar);
  const nextKind = getCharKind(nextChar);

  const hasLeftBoundary =
    previousKind === 'boundary' || previousKind !== firstKind;
  const hasRightBoundary =
    nextKind === 'boundary' || nextKind !== lastKind;

  return hasLeftBoundary && hasRightBoundary;
}

function hasKanji(text: string) {
  return /\p{Script=Han}/u.test(text);
}

function findMatchedWords(text: string, words: string[]) {
  return uniq(
    words.filter((word) => {
      if (!word) {
        return false;
      }

      const pattern = hasKanji(word)
        ? `${escapeRegExp(word)}(?:[ぁ-ん]*)`
        : escapeRegExp(word);
      const matcher = new RegExp(pattern, 'giu');

      for (const match of text.matchAll(matcher)) {
        const start = match.index;
        const matchedText = match[0];

        if (start === undefined) {
          continue;
        }

        const end = start + matchedText.length;
        if (hasKeywordBoundary(text, start, end, word)) {
          return true;
        }
      }

      return false;
    }),
  );
}

function isKatakanaWord(word: string) {
  return KATAKANA_WORD_PATTERN.test(word);
}

function extractBlockedWordCandidates(text: string) {
  return uniq(text.match(KATAKANA_TOKEN_PATTERN) ?? []);
}

function findExactBlockedWords(text: string, words: string[]) {
  const candidates = extractBlockedWordCandidates(text).map((candidate) => ({
    original: candidate,
    normalized: normalizeText(candidate),
  }));
  const blockedSet = new Set(words.map((word) => normalizeText(word)));

  return uniq(
    candidates
      .filter((candidate) => blockedSet.has(candidate.normalized))
      .map((candidate) => candidate.original),
  );
}

function findGeneralKatakanaWords(text: string) {
  return extractBlockedWordCandidates(text).filter(
    (candidate) =>
      isKatakanaWord(candidate) &&
      candidate.length >= 3 &&
      !allowedKatakana.has(candidate),
  );
}

function calculateHiraganaRatio(text: string) {
  const japaneseCount = (text.match(JAPANESE_PATTERN) ?? []).length;
  if (japaneseCount === 0) {
    return 0;
  }

  const hiraganaCount = (text.match(HIRAGANA_PATTERN) ?? []).length;
  return hiraganaCount / japaneseCount;
}

function buildFeedback(result: EvaluationResult) {
  if (result.isZeroScore) {
    return '意味の中心がつかめていません。ヒントを見て、「何のことか」を短く言い直してください。';
  }

  if (result.score >= 85) {
    return 'かなりやさしく言い換えられています。短くて意味も伝わっています。';
  }

  if (result.detectedNgWords.length > 0 || result.katakanaWords.length > 0) {
    return 'まだ難しい言葉が残っています。カタカナを使わず、ふだんの言い方へ置き換えてください。';
  }

  if (result.missingKeywords.length > 0) {
    return '意味の大事な部分が少し足りません。ヒントを見て、何をする言葉かを足してください。';
  }

  if (result.lengthPenalty) {
    return '説明が少し長めです。ひと息で言える長さにすると、もっと伝わりやすくなります。';
  }

  return 'あと一歩です。短く、やさしく、意味を外さない形に整えると伸びます。';
}

function evaluateAnswer(challenge: Challenge, answer: string): EvaluationResult {
  const trimmed = answer.trim();
  const matchedKeywords = findMatchedWords(trimmed, challenge.keywords);
  const missingKeywords = challenge.keywords.filter((word) => !matchedKeywords.includes(word));
  const exactBlockedWords = findExactBlockedWords(trimmed, [challenge.term, ...challenge.ngWords]);
  const katakanaWords = findGeneralKatakanaWords(trimmed);
  const detectedNgWords = uniq([...exactBlockedWords, ...katakanaWords]);
  const totalBlockedWords = detectedNgWords;
  const lengthPenalty = trimmed.replace(/\s+/g, '').length > LONG_TEXT_THRESHOLD;
  const hiraganaRatio = calculateHiraganaRatio(trimmed);
  const simplicityBonus = Math.round(hiraganaRatio * 20);

  let score = 100;
  score -= totalBlockedWords.length * 30;

  if (lengthPenalty) {
    score -= 10;
  }

  if (matchedKeywords.length > 0) {
    const keywordCoverage = matchedKeywords.length / challenge.keywords.length;
    score -= Math.round((1 - keywordCoverage) * 25);
  }

  score += simplicityBonus;

  const weakMeaning = matchedKeywords.length === 0;
  const looksUnrelated =
    weakMeaning &&
    (trimmed.length < 8 || totalBlockedWords.length > 0 || hiraganaRatio < 0.18);

  let cappedAtThirty = false;
  let isZeroScore = false;

  if (looksUnrelated) {
    score = 0;
    isZeroScore = true;
  } else if (weakMeaning) {
    score = Math.min(score, 30);
    cappedAtThirty = true;
  }

  score = Math.max(0, Math.min(100, score));

  const baseResult: EvaluationResult = {
    score,
    matchedKeywords,
    missingKeywords,
    detectedNgWords,
    katakanaWords,
    lengthPenalty,
    simplicityBonus,
    cappedAtThirty,
    isZeroScore,
    feedback: '',
  };

  return {
    ...baseResult,
    feedback: buildFeedback(baseResult),
  };
}

export default function TranslateChallenge() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [result, setResult] = useState<EvaluationResult | null>(null);
  const [saved, setSaved] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [speechSupported] = useState(
    () =>
      typeof window !== 'undefined' &&
      !!(window.SpeechRecognition || window.webkitSpeechRecognition),
  );
  const [toast, setToast] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const challenge = translateChallenges[currentIndex];

  const matchedNgWords = useMemo(
    () =>
      uniq([
        ...findExactBlockedWords(answer, [challenge.term, ...challenge.ngWords]),
        ...findGeneralKatakanaWords(answer),
      ]),
    [answer, challenge],
  );
  const warningWords = matchedNgWords;
  const charCount = answer.replace(/\s/g, '').length;

  useEffect(() => {
    if (!toast) {
      return;
    }

    const timerId = window.setTimeout(() => setToast(null), 2400);
    return () => window.clearTimeout(timerId);
  }, [toast]);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current = null;
      }
    };
  }, []);

  const handleVoiceInput = () => {
    const SpeechRecognitionConstructor =
      window.SpeechRecognition ?? window.webkitSpeechRecognition;

    if (!SpeechRecognitionConstructor) {
      return;
    }

    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognitionConstructor();
    recognition.lang = 'ja-JP';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = (event) => {
      const transcript = event.results[0]?.[0]?.transcript ?? '';
      setAnswer((current) => `${current}${current ? ' ' : ''}${transcript}`.trim());
      setResult(null);
      setSaved(false);
    };

    recognition.onerror = () => {
      setIsListening(false);
      recognitionRef.current = null;
    };

    recognition.onend = () => {
      setIsListening(false);
      recognitionRef.current = null;
    };

    recognitionRef.current = recognition;
    setIsListening(true);
    recognition.start();
  };

  const handleSubmit = () => {
    if (!answer.trim()) {
      setToast('回答を入力してください。');
      return;
    }

    setResult(evaluateAnswer(challenge, answer));
    setSaved(false);
  };

  const handleNext = () => {
    setCurrentIndex((current) => (current + 1) % translateChallenges.length);
    setAnswer('');
    setResult(null);
    setSaved(false);
  };

  const handleSave = () => {
    if (isLoading || saved) {
      return;
    }

    if (!result) {
      setToast('先に判定してください。');
      return;
    }

    setIsLoading(true);

    try {
      const content: TranslateContent = {
        term: challenge.term,
        answer: answer.trim(),
        score: result.score,
        examples: challenge.examples,
        ngWords: challenge.ngWords,
        flaggedWords: result.detectedNgWords,
      };

      const saveResult = saveWork({
        workType: 'translate',
        title: `${challenge.term}をやさしく言い換え`,
        content,
      });

      if (!saveResult) {
        setToast('保存に失敗しました。');
        return;
      }

      setToast('結果を保存しました。');
      setSaved(true);
    } catch {
      setToast('保存に失敗しました。');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      {toast ? (
        <div className="pointer-events-none fixed inset-x-0 top-4 z-50 flex justify-center px-4">
          <div
            role="status"
            aria-live="polite"
            aria-atomic="true"
            className="rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-lg"
          >
            {toast}
          </div>
        </div>
      ) : null}

      <section className="overflow-hidden rounded-[28px] bg-gradient-to-br from-indigo-950 via-indigo-900 to-slate-900 text-white shadow-xl">
        <div className="px-5 py-6 sm:px-7">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 ${categoryMeta[challenge.category].className}`}
            >
              {categoryMeta[challenge.category].label}
            </span>
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${difficultyMeta[challenge.difficulty].className}`}
            >
              {difficultyMeta[challenge.difficulty].label}
            </span>
            <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-indigo-100">
              Step 1 / お題
            </span>
          </div>

          <div className="mt-6">
            <p className="text-sm font-medium text-indigo-200">やさしい言葉に言い換えてください</p>
            <h2 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">{challenge.term}</h2>
            <p className="mt-2 text-sm text-indigo-100">よみ: {challenge.reading}</p>
          </div>

          <div className="mt-6 rounded-2xl border border-white/10 bg-white/10 p-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-white">
              <Lightbulb className="h-4 w-4 text-amber-300" />
              ヒント
            </div>
            <p className="mt-2 text-sm leading-7 text-indigo-50">{challenge.hint}</p>
          </div>
        </div>
      </section>

      <section className="rounded-[28px] bg-white p-5 shadow-sm ring-1 ring-indigo-100 sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-indigo-600">Step 2 / 回答入力</p>
            <p className="mt-1 text-sm text-slate-500">カタカナや専門語を残さず、短く言い換えます。</p>
          </div>
          <button
            type="button"
            onClick={handleVoiceInput}
            disabled={!speechSupported}
            className={`inline-flex h-11 w-11 items-center justify-center rounded-full transition ${
              speechSupported
                ? isListening
                  ? 'bg-rose-600 text-white hover:bg-rose-700'
                  : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
                : 'cursor-not-allowed bg-slate-100 text-slate-400'
            }`}
            aria-label={isListening ? '音声入力を停止' : '音声入力を開始'}
          >
            {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
          </button>
        </div>

        <div className="mt-5">
          <textarea
            aria-label="お題の言い換えを入力"
            value={answer}
            onChange={(event) => {
              setAnswer(event.target.value.slice(0, MAX_LENGTH));
              setSaved(false);
              if (result) {
                setResult(null);
              }
            }}
            placeholder="例: 毎月お金を払って使い続けるしくみ"
            className="min-h-32 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-base text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100"
          />
          <div className="mt-3 flex items-center justify-between gap-3 text-xs text-slate-500">
            <span className="inline-flex items-center gap-1">
              <Volume2 className="h-3.5 w-3.5" />
              {speechSupported
                ? isListening
                  ? '音声を聞き取っています'
                  : '音声入力も使えます'
                : 'このブラウザでは音声入力を使えません'}
            </span>
            <span className={charCount > LONG_TEXT_THRESHOLD ? 'font-semibold text-amber-600' : ''}>
              {charCount}/{MAX_LENGTH}文字
            </span>
          </div>
        </div>

        {warningWords.length > 0 ? (
          <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-900">
            <div className="flex items-start gap-2">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <div>
                <p className="text-sm font-semibold">まだ難しい言葉が含まれています</p>
                <p className="mt-1 text-sm leading-6">
                  検出語: {warningWords.join('、')}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-900">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
              <p className="text-sm font-semibold">今のところ難しい言葉は見つかっていません。</p>
            </div>
          </div>
        )}

        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={handleSubmit}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
          >
            判定する
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </section>

      {result ? (
        <section className="rounded-[28px] bg-white p-5 shadow-sm ring-1 ring-indigo-100 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-indigo-600">Step 3 / 判定と模範回答</p>
              <h3 className="mt-2 text-2xl font-bold text-slate-900">スコア {result.score} 点</h3>
              <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-600">{result.feedback}</p>
            </div>
            <div className="rounded-3xl bg-gradient-to-br from-indigo-600 to-sky-500 px-5 py-4 text-white shadow-lg">
              <p className="text-xs uppercase tracking-[0.2em] text-indigo-100">Plain Score</p>
              <p className="mt-1 text-4xl font-bold">{result.score}</p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                <Sparkles className="h-4 w-4 text-indigo-600" />
                判定の内訳
              </div>
              <div className="mt-4 space-y-3 text-sm text-slate-600">
                <p>
                  NG語: {result.detectedNgWords.length > 0 ? result.detectedNgWords.join('、') : 'なし'}
                </p>
                <p>
                  カタカナ語: {result.katakanaWords.length > 0 ? result.katakanaWords.join('、') : 'なし'}
                </p>
                <p>
                  意味キーワード: {result.matchedKeywords.length > 0 ? result.matchedKeywords.join('、') : '一致なし'}
                </p>
                <p>
                  足りない要素: {result.missingKeywords.length > 0 ? result.missingKeywords.join('、') : 'なし'}
                </p>
                <p>長さペナルティ: {result.lengthPenalty ? '-10点' : 'なし'}</p>
                <p>ひらがな比率ボーナス: +{result.simplicityBonus}点</p>
                {result.cappedAtThirty ? (
                  <p className="font-semibold text-amber-700">
                    キーワード不足のため、得点は30点以下に制限されています。
                  </p>
                ) : null}
                {result.isZeroScore ? (
                  <p className="font-semibold text-rose-700">
                    意味の中心が外れているため、0点判定です。
                  </p>
                ) : null}
              </div>
            </div>

            <div className="rounded-2xl bg-indigo-50 p-4 ring-1 ring-indigo-100">
              <div className="flex items-center gap-2 text-sm font-semibold text-indigo-950">
                <BookOpen className="h-4 w-4 text-indigo-600" />
                模範回答
              </div>
              <div className="mt-4 space-y-3">
                {challenge.examples.map((example, index) => (
                  <div
                    key={example}
                    className="rounded-2xl bg-white px-4 py-3 text-sm leading-7 text-slate-700 ring-1 ring-indigo-100"
                  >
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-400">
                      Example {index + 1}
                    </p>
                    <p className="mt-1">{example}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={handleSave}
              disabled={isLoading || saved}
              className={`inline-flex items-center justify-center gap-2 rounded-2xl border px-5 py-3 text-sm font-semibold transition ${
                isLoading || saved
                  ? 'cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400'
                  : 'border-indigo-200 bg-white text-indigo-700 hover:bg-indigo-50'
              }`}
            >
              <Save className="h-4 w-4" />
              {isLoading ? '保存中...' : saved ? '保存済み' : '保存する'}
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              次のお題
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </section>
      ) : null}
    </div>
  );
}
