"use client";

import { Check, ChevronDown, ChevronUp, Eye, Save } from "lucide-react";
import { useMemo, useState } from "react";
import { PYRAMID_EXAMPLES } from "@/lib/examples";

export interface PyramidContent {
  topic: string;
  conclusion: string;
  reasons: string[];
  selfCheck: {
    summarized: boolean;
    mece: boolean;
    directSupport: boolean;
  };
}

interface Props {
  onSave: (content: PyramidContent) => void;
  isLoading?: boolean;
}

const PRESET_TOPICS = [
  "リモートワークは生産性を上げるか？",
  "新卒はまず大企業に入るべきか？",
  "日本の英語教育は改善すべきか？",
  "サブスクは消費者にとって得か？",
  "AIは仕事を奪うか？",
] as const;

const EMPTY_REASONS = ["", "", ""];

export default function PyramidWork({
  onSave,
  isLoading = false,
}: Props) {
  const [selectedTopic, setSelectedTopic] = useState<string>("");
  const [customTopic, setCustomTopic] = useState("");
  const [conclusion, setConclusion] = useState("");
  const [reasons, setReasons] = useState<string[]>(EMPTY_REASONS);
  const [selfCheck, setSelfCheck] = useState({
    summarized: false,
    mece: false,
    directSupport: false,
  });
  const [validationError, setValidationError] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [showExample, setShowExample] = useState(false);

  const topic = useMemo(() => {
    const trimmedCustomTopic = customTopic.trim();
    if (trimmedCustomTopic) return trimmedCustomTopic;
    return selectedTopic.trim();
  }, [customTopic, selectedTopic]);

  const handleReasonChange = (index: number, value: string) => {
    setReasons((current) => current.map((reason, i) => (i === index ? value : reason)));
    setValidationError("");
  };

  const handleSelfCheckChange = (
    key: keyof PyramidContent["selfCheck"],
    value: boolean,
  ) => {
    setSelfCheck((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const handleSave = () => {
    const trimmedTopic = topic.trim();
    const trimmedConclusion = conclusion.trim();
    const trimmedReasons = reasons.map((reason) => reason.trim());

    if (!trimmedTopic) {
      setValidationError("お題を選択または入力してください");
      return;
    }

    if (!trimmedConclusion) {
      setValidationError("結論を入力してください");
      return;
    }

    if (trimmedReasons.some((reason) => !reason)) {
      setValidationError("理由を3つすべて入力してください");
      return;
    }

    setValidationError("");
    setShowSuccess(true);

    setTimeout(() => {
      onSave({
        topic: trimmedTopic,
        conclusion: trimmedConclusion,
        reasons: trimmedReasons,
        selfCheck,
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
        <div className="rounded-2xl border border-indigo-100 bg-indigo-50/50 p-4">
          <button
            type="button"
            onClick={() => setShowExample((current) => !current)}
            className="flex w-full items-center justify-between text-left"
          >
            <span className="flex items-center gap-2 text-sm font-semibold text-indigo-600">
              <Eye className="h-4 w-4" />
              {topic && PYRAMID_EXAMPLES[topic] ? "この お題の回答例を見る" : "回答例を見る"}
            </span>
            {showExample ? (
              <ChevronUp className="h-4 w-4 text-indigo-400" />
            ) : (
              <ChevronDown className="h-4 w-4 text-indigo-400" />
            )}
          </button>
          {showExample && (() => {
            const example = (topic && PYRAMID_EXAMPLES[topic]) || PYRAMID_EXAMPLES["リモートワークは生産性を上げるか？"];
            if (!example) return null;
            return (
              <div className="mt-4 space-y-3">
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3">
                  <p className="text-xs font-bold text-emerald-700">結論</p>
                  <p className="mt-2 text-sm text-slate-700">{example.conclusion}</p>
                </div>
                <div className="space-y-2">
                  {example.reasons.map((reason, index) => (
                    <div key={`ex-reason-${index}`} className="rounded-xl border border-sky-200 bg-sky-50 p-3">
                      <p className="text-xs font-bold text-sky-700">理由 {index + 1}</p>
                      <p className="mt-2 text-sm text-slate-700">{reason}</p>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-slate-400">
                  結論→理由の順で、MECEに整理されている例です。自分の言葉で書き直してみましょう。
                </p>
              </div>
            );
          })()}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm font-semibold text-indigo-600">Step 1</p>
          <h2 className="mt-1 text-lg font-semibold text-slate-900">お題を選ぶ</h2>
          <p className="mt-1 text-sm text-slate-500">
            プリセットから選ぶか、自分でお題を入力してください。
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            {PRESET_TOPICS.map((preset) => {
              const isActive = selectedTopic === preset && !customTopic.trim();
              return (
                <button
                  key={preset}
                  type="button"
                  onClick={() => {
                    setSelectedTopic(preset);
                    setCustomTopic("");
                    setValidationError("");
                  }}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                    isActive
                      ? "bg-indigo-600 text-white"
                      : "border border-slate-300 bg-white text-slate-700 hover:border-indigo-300 hover:text-indigo-600"
                  }`}
                >
                  {preset}
                </button>
              );
            })}
          </div>

          <div className="mt-4">
            <label htmlFor="custom-topic" className="text-sm font-medium text-slate-700">
              自由入力
            </label>
            <input
              id="custom-topic"
              type="text"
              value={customTopic}
              onChange={(event) => {
                setCustomTopic(event.target.value);
                setValidationError("");
              }}
              placeholder="例: 学校にプレゼン授業は必要か？"
              className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100"
            />
          </div>

          {topic && (
            <div className="mt-4 rounded-2xl bg-white p-4 ring-1 ring-slate-200">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Selected Topic</p>
              <p className="mt-2 text-sm font-medium text-slate-800">{topic}</p>
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm font-semibold text-indigo-600">Step 2</p>
          <label htmlFor="conclusion" className="mt-1 block text-lg font-semibold text-slate-900">
            結論を1文で書く
          </label>
          <p className="mt-1 text-sm text-slate-500">
            お題に対する自分の答えを、まず一文で言い切ってください。
          </p>
          <textarea
            id="conclusion"
            value={conclusion}
            onChange={(event) => {
              setConclusion(event.target.value);
              setValidationError("");
            }}
            placeholder="例: リモートワークは、職種と運用次第で生産性を上げられる。"
            rows={4}
            className="mt-3 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100"
          />
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm font-semibold text-indigo-600">Step 3</p>
          <h2 className="mt-1 text-lg font-semibold text-slate-900">理由を3つ書く</h2>
          <p className="mt-1 text-sm text-slate-500">
            結論を支える根拠を、重ならないように3つに分けて整理します。
          </p>

          <div className="mt-4 grid gap-4">
            {reasons.map((reason, index) => (
              <div key={`reason-${index}`} className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
                <label
                  htmlFor={`reason-${index}`}
                  className="text-sm font-semibold text-slate-700"
                >
                  理由 {index + 1}
                </label>
                <textarea
                  id={`reason-${index}`}
                  value={reason}
                  onChange={(event) => handleReasonChange(index, event.target.value)}
                  placeholder={`例: 理由${index + 1}を書く`}
                  rows={3}
                  className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm font-semibold text-indigo-600">Step 4</p>
          <h2 className="mt-1 text-lg font-semibold text-slate-900">セルフチェック</h2>
          <p className="mt-1 text-sm text-slate-500">
            書いた内容がピラミッドとして成立しているか確認してください。
          </p>

          <div className="mt-4 space-y-4">
            {[
              {
                key: "summarized" as const,
                label: "結論が理由のまとめになっているか？",
              },
              {
                key: "mece" as const,
                label: "理由はMECE（漏れ・ダブりなし）か？",
              },
              {
                key: "directSupport" as const,
                label: "各理由は結論の直接的な根拠か？",
              },
            ].map((item) => (
              <div key={item.key} className="rounded-2xl bg-white p-4 ring-1 ring-slate-200">
                <p className="text-sm font-medium text-slate-800">{item.label}</p>
                <div className="mt-3 flex gap-3">
                  <button
                    type="button"
                    onClick={() => handleSelfCheckChange(item.key, true)}
                    className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                      selfCheck[item.key]
                        ? "bg-indigo-600 text-white"
                        : "border border-slate-300 bg-white text-slate-700 hover:border-indigo-300 hover:text-indigo-600"
                    }`}
                  >
                    Yes
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelfCheckChange(item.key, false)}
                    className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                      !selfCheck[item.key]
                        ? "bg-slate-900 text-white"
                        : "border border-slate-300 bg-white text-slate-700 hover:border-slate-400 hover:text-slate-900"
                    }`}
                  >
                    No
                  </button>
                </div>
              </div>
            ))}
          </div>
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
