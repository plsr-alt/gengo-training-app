"use client";

import { AlertTriangle, Check, ChevronDown, ChevronUp, Eye, Plus, Save, Trash2 } from "lucide-react";
import { useState } from "react";

export interface FactEmotionContent {
  trigger: string;
  facts: string[];
  emotions: string[];
  assumptions: number[];
}

interface Props {
  onSave: (content: FactEmotionContent) => void;
  isLoading?: boolean;
}

const INTERPRETATION_PATTERN = /(だ|である|した|だった|にちがいない|はずだ|かもしれない|と思う|だろう)$/;

function normalizeText(value: string) {
  return value.trim().replace(/[。．.!！?？]+$/g, "");
}

export default function FactEmotionWork({
  onSave,
  isLoading = false,
}: Props) {
  const [trigger, setTrigger] = useState("");
  const [factInput, setFactInput] = useState("");
  const [emotionInput, setEmotionInput] = useState("");
  const [facts, setFacts] = useState<string[]>([]);
  const [emotions, setEmotions] = useState<string[]>([]);
  const [assumptions, setAssumptions] = useState<number[]>([]);
  const [validationError, setValidationError] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [showExample, setShowExample] = useState(false);

  const addFact = () => {
    const nextFact = factInput.trim();
    if (!nextFact) return;
    setFacts((current) => [...current, nextFact]);
    setFactInput("");
    setValidationError("");
  };

  const addEmotion = () => {
    const nextEmotion = emotionInput.trim();
    if (!nextEmotion) return;
    setEmotions((current) => [...current, nextEmotion]);
    setEmotionInput("");
    setValidationError("");
  };

  const removeFact = (index: number) => {
    setFacts((current) => current.filter((_, i) => i !== index));
  };

  const removeEmotion = (index: number) => {
    if (!window.confirm("この項目を削除しますか?")) return;
    setEmotions((current) => current.filter((_, i) => i !== index));
    setAssumptions((current) =>
      current
        .filter((i) => i !== index)
        .map((i) => (i > index ? i - 1 : i)),
    );
  };

  const checkAssumptions = () => {
    const nextAssumptions = emotions.reduce<number[]>((indexes, emotion, index) => {
      if (INTERPRETATION_PATTERN.test(normalizeText(emotion))) {
        indexes.push(index);
      }
      return indexes;
    }, []);
    setAssumptions(nextAssumptions);
  };

  const handleSave = () => {
    const trimmedTrigger = trigger.trim();
    if (!trimmedTrigger) {
      setValidationError("「心が動いた出来事」を入力してください");
      return;
    }
    if (facts.length === 0 && emotions.length === 0) {
      setValidationError("事実または感情を1つ以上追加してください");
      return;
    }
    setValidationError("");
    setShowSuccess(true);
    setTimeout(() => {
      onSave({
        trigger: trimmedTrigger,
        facts,
        emotions,
        assumptions,
      });
    }, 1200);
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
        {/* Example section */}
        <div className="rounded-2xl border border-indigo-100 bg-indigo-50/50 p-4">
          <button
            type="button"
            onClick={() => setShowExample(!showExample)}
            className="flex w-full items-center justify-between text-left"
          >
            <span className="flex items-center gap-2 text-sm font-semibold text-indigo-600">
              <Eye className="h-4 w-4" />
              例を見る
            </span>
            {showExample ? (
              <ChevronUp className="h-4 w-4 text-indigo-400" />
            ) : (
              <ChevronDown className="h-4 w-4 text-indigo-400" />
            )}
          </button>
          {showExample && (
            <div className="mt-4 space-y-3">
              <div className="rounded-xl bg-white p-3">
                <p className="text-xs font-bold text-slate-500">出来事</p>
                <p className="mt-1 text-sm text-slate-800">会議で自分の提案を上司に否定された</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3">
                  <p className="text-xs font-bold text-emerald-700">事実</p>
                  <ul className="mt-2 space-y-1 text-sm text-slate-700">
                    <li>・上司が「再検討してほしい」と言った</li>
                    <li>・他の3人は発言しなかった</li>
                    <li>・会議は予定通り30分で終了した</li>
                  </ul>
                </div>
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
                  <p className="text-xs font-bold text-amber-700">感情</p>
                  <ul className="mt-2 space-y-1 text-sm text-slate-700">
                    <li>・自分の意見は価値がないと感じた</li>
                    <li>・上司に嫌われたかもしれない</li>
                    <li>・もう提案するのはやめようと思った</li>
                  </ul>
                </div>
              </div>
              <p className="text-xs text-slate-400">
                このように、起きたことと感じたことを分けて書いてみましょう。
              </p>
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm font-semibold text-indigo-600">Step 1</p>
          <label htmlFor="trigger" className="mt-1 block text-lg font-semibold text-slate-900">
            心が動いた出来事
          </label>
          <p className="mt-1 text-sm text-slate-500">
            最近あった出来事で、心がざわついたこと、嬉しかったこと、モヤモヤしたことを書いてください。
          </p>
          <textarea
            id="trigger"
            value={trigger}
            onChange={(event) => { setTrigger(event.target.value); setValidationError(""); }}
            placeholder="例: 会議で自分の提案を否定された"
            rows={4}
            aria-required="true"
            className="mt-3 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100"
          />
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm font-semibold text-indigo-600">Step 2</p>
          <p className="mt-1 text-sm text-slate-500">
            その出来事を「事実（実際に起きたこと）」と「感情（自分が感じたこと・考えたこと）」に分けてみましょう。
          </p>
          <div className="mt-3 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
              <h2 id="fact-label" className="text-lg font-semibold text-slate-900">事実</h2>
              <p className="mt-1 text-sm text-slate-500">誰が見ても同じように確認できること。</p>
              <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                <input
                  value={factInput}
                  onChange={(event) => setFactInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") { event.preventDefault(); addFact(); }
                  }}
                  placeholder="例: 上司が「再検討して」と言った"
                  aria-labelledby="fact-label"
                  className="min-w-0 flex-1 rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100"
                />
                <button
                  type="button"
                  onClick={addFact}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700"
                >
                  <Plus className="h-4 w-4" />
                  追加
                </button>
              </div>
              <ul className="mt-4 space-y-2" aria-label="事実リスト">
                {facts.length === 0 ? (
                  <li className="rounded-xl border border-dashed border-slate-300 px-3 py-4 text-sm text-slate-400">
                    まだ追加されていません
                  </li>
                ) : (
                  facts.map((fact, index) => (
                    <li
                      key={`f-${index}`}
                      className="flex items-start justify-between gap-3 rounded-xl border border-slate-200 px-3 py-3 text-sm text-slate-700"
                    >
                      <span className="break-words">• {fact}</span>
                      <button
                        type="button"
                        onClick={() => removeFact(index)}
                        className="shrink-0 rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                        aria-label={`事実「${fact}」を削除`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </li>
                  ))
                )}
              </ul>
            </div>

            <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
              <h2 id="emotion-label" className="text-lg font-semibold text-slate-900">感情・解釈</h2>
              <p className="mt-1 text-sm text-slate-500">自分だけが感じたこと、頭に浮かんだ考えや解釈。</p>
              <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                <input
                  value={emotionInput}
                  onChange={(event) => setEmotionInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") { event.preventDefault(); addEmotion(); }
                  }}
                  placeholder="例: 自分の意見は価値がないと感じた"
                  aria-labelledby="emotion-label"
                  className="min-w-0 flex-1 rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100"
                />
                <button
                  type="button"
                  onClick={addEmotion}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700"
                >
                  <Plus className="h-4 w-4" />
                  追加
                </button>
              </div>
              <ul className="mt-4 space-y-2" aria-label="感情・解釈リスト">
                {emotions.length === 0 ? (
                  <li className="rounded-xl border border-dashed border-slate-300 px-3 py-4 text-sm text-slate-400">
                    まだ追加されていません
                  </li>
                ) : (
                  emotions.map((emotion, index) => {
                    const isAssumption = assumptions.includes(index);
                    return (
                      <li
                        key={`e-${index}`}
                        className={`flex items-start justify-between gap-3 rounded-xl px-3 py-3 text-sm ${
                          isAssumption
                            ? "border border-orange-200 bg-orange-50 text-orange-900"
                            : "border border-slate-200 text-slate-700"
                        }`}
                      >
                        <div className="flex min-w-0 items-start gap-2">
                          {isAssumption && (
                            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-orange-500" />
                          )}
                          <span className="break-words">• {emotion}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeEmotion(index)}
                          className="shrink-0 rounded-lg p-2 text-slate-400 transition hover:bg-white/70 hover:text-slate-700"
                          aria-label={`感情「${emotion}」を削除`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </li>
                    );
                  })
                )}
              </ul>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm font-semibold text-indigo-600">Step 3</p>
          <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">解釈チェック</h2>
              <p className="mt-1 text-sm text-slate-500">
                感情欄の中に、事実と解釈が混ざっている可能性がある項目を見つけます。
                <br />
                <span className="text-xs text-slate-400">
                  ※ これは補助的なヒントです。最終的な判断はあなた自身が行ってください。
                </span>
              </p>
            </div>
            <button
              type="button"
              onClick={checkAssumptions}
              disabled={emotions.length === 0}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-indigo-200 bg-white px-4 py-2 text-sm font-semibold text-indigo-600 transition hover:bg-indigo-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <AlertTriangle className="h-4 w-4" />
              解釈チェック
            </button>
          </div>
          {assumptions.length > 0 && (
            <div className="mt-3 rounded-xl border border-orange-200 bg-orange-50 p-3">
              <p className="text-sm text-orange-700">
                {assumptions.length}件の項目に、事実と解釈が混ざっている可能性があります。
                オレンジ色の項目を見直してみてください。「本当にそうだったか?」と問いかけることが大切です。
              </p>
            </div>
          )}
        </div>

        {validationError && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
            {validationError}
          </div>
        )}

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
