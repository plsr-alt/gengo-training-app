"use client";

import { AlertTriangle, Plus, Save, Trash2 } from "lucide-react";
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

const FACT_LIKE_PATTERN = /(だ|である|した)$/;

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

  const addFact = () => {
    const nextFact = factInput.trim();
    if (!nextFact) {
      return;
    }

    setFacts((current) => [...current, nextFact]);
    setFactInput("");
  };

  const addEmotion = () => {
    const nextEmotion = emotionInput.trim();
    if (!nextEmotion) {
      return;
    }

    setEmotions((current) => [...current, nextEmotion]);
    setEmotionInput("");
  };

  const removeFact = (index: number) => {
    setFacts((current) => current.filter((_, currentIndex) => currentIndex !== index));
  };

  const removeEmotion = (index: number) => {
    setEmotions((current) => current.filter((_, currentIndex) => currentIndex !== index));
    setAssumptions((current) =>
      current
        .filter((currentIndex) => currentIndex !== index)
        .map((currentIndex) => (currentIndex > index ? currentIndex - 1 : currentIndex)),
    );
  };

  const checkAssumptions = () => {
    const nextAssumptions = emotions.reduce<number[]>((indexes, emotion, index) => {
      if (FACT_LIKE_PATTERN.test(normalizeText(emotion))) {
        indexes.push(index);
      }

      return indexes;
    }, []);

    setAssumptions(nextAssumptions);
  };

  const handleSave = () => {
    onSave({
      trigger: trigger.trim(),
      facts,
      emotions,
      assumptions,
    });
  };

  return (
    <section className="mx-auto w-full max-w-4xl rounded-3xl bg-white p-4 shadow-lg ring-1 ring-slate-200 sm:p-6">
      <div className="space-y-6">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm font-semibold text-indigo-600">Step 1</p>
          <label htmlFor="trigger" className="mt-1 block text-lg font-semibold text-slate-900">
            心が動いた出来事
          </label>
          <textarea
            id="trigger"
            value={trigger}
            onChange={(event) => setTrigger(event.target.value)}
            placeholder="何が起きて、どこで心が動いたかを書いてください"
            rows={5}
            className="mt-3 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100"
          />
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm font-semibold text-indigo-600">Step 2</p>
          <div className="mt-3 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
              <h2 className="text-lg font-semibold text-slate-900">事実</h2>
              <p className="mt-1 text-sm text-slate-500">見たこと、聞いたこと、起きたことを分けます。</p>
              <div className="mt-4 flex gap-2">
                <input
                  value={factInput}
                  onChange={(event) => setFactInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      addFact();
                    }
                  }}
                  placeholder="事実を1つ入力"
                  className="min-w-0 flex-1 rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100"
                />
                <button
                  type="button"
                  onClick={addFact}
                  className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700"
                >
                  <Plus className="h-4 w-4" />
                  追加
                </button>
              </div>
              <ul className="mt-4 space-y-2">
                {facts.length === 0 ? (
                  <li className="rounded-xl border border-dashed border-slate-300 px-3 py-4 text-sm text-slate-400">
                    まだ追加されていません
                  </li>
                ) : (
                  facts.map((fact, index) => (
                    <li
                      key={`${fact}-${index}`}
                      className="flex items-start justify-between gap-3 rounded-xl border border-slate-200 px-3 py-3 text-sm text-slate-700"
                    >
                      <span className="break-words">• {fact}</span>
                      <button
                        type="button"
                        onClick={() => removeFact(index)}
                        className="shrink-0 rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                        aria-label="事実を削除"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </li>
                  ))
                )}
              </ul>
            </div>

            <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
              <h2 className="text-lg font-semibold text-slate-900">感情</h2>
              <p className="mt-1 text-sm text-slate-500">感じたこと、浮かんだ解釈や気持ちを出します。</p>
              <div className="mt-4 flex gap-2">
                <input
                  value={emotionInput}
                  onChange={(event) => setEmotionInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      addEmotion();
                    }
                  }}
                  placeholder="感情を1つ入力"
                  className="min-w-0 flex-1 rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100"
                />
                <button
                  type="button"
                  onClick={addEmotion}
                  className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700"
                >
                  <Plus className="h-4 w-4" />
                  追加
                </button>
              </div>
              <ul className="mt-4 space-y-2">
                {emotions.length === 0 ? (
                  <li className="rounded-xl border border-dashed border-slate-300 px-3 py-4 text-sm text-slate-400">
                    まだ追加されていません
                  </li>
                ) : (
                  emotions.map((emotion, index) => {
                    const isAssumption = assumptions.includes(index);

                    return (
                      <li
                        key={`${emotion}-${index}`}
                        className={`flex items-start justify-between gap-3 rounded-xl px-3 py-3 text-sm ${
                          isAssumption
                            ? "border border-orange-200 bg-orange-50 text-orange-900"
                            : "border border-slate-200 text-slate-700"
                        }`}
                      >
                        <div className="flex min-w-0 items-start gap-2">
                          {isAssumption ? (
                            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-orange-500" />
                          ) : null}
                          <span className="break-words">• {emotion}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeEmotion(index)}
                          className="shrink-0 rounded-lg p-2 text-slate-400 transition hover:bg-white/70 hover:text-slate-700"
                          aria-label="感情を削除"
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
              <h2 className="text-lg font-semibold text-slate-900">思い込みチェック</h2>
              <p className="mt-1 text-sm text-slate-500">
                感情欄のうち「〜だ」「〜である」「〜した」で終わる項目を事実候補として強調表示します。
              </p>
            </div>
            <button
              type="button"
              onClick={checkAssumptions}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-indigo-200 bg-white px-4 py-2 text-sm font-semibold text-indigo-600 transition hover:bg-indigo-50"
            >
              <AlertTriangle className="h-4 w-4" />
              思い込みチェック
            </button>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleSave}
            disabled={isLoading}
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
