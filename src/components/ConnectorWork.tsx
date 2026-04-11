"use client";

import { AlertTriangle, Check, ChevronDown, ChevronUp, Eye, Save } from "lucide-react";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import { CONNECTOR_EXAMPLES } from "@/lib/examples";

export interface ConnectorContent {
  original: string;
  rewritten: string;
  remainingBadConnectors: string[];
  selfCheck: { eliminated: boolean; causalClear: boolean; claimClear: boolean };
}

interface Props {
  onSave: (content: ConnectorContent) => void;
  isLoading?: boolean;
}

type SelfCheckState = {
  eliminated: boolean | null;
  causalClear: boolean | null;
  claimClear: boolean | null;
};

type Detection = {
  connector: string;
  start: number;
  end: number;
};

const PRESETS = [
  "売上が下がっていて、コストも上がっているし、利益が減っている",
  "新システムを導入したが、使い方がわからなくて、問い合わせが増えている",
  "リモートワークになり、コミュニケーションが減って、チームの一体感がなくなっている",
  "競合が値下げしていて、うちも合わせないといけないし、品質も上げないといけない",
  "人手が足りなくて、残業が増えているが、採用もうまくいっていない",
] as const;

const GOOD_CONNECTORS = [
  "だから",
  "しかし",
  "なぜなら",
  "一方で",
  "つまり",
  "したがって",
  "そのため",
  "その結果",
] as const;

const CONJUGATION_ENDINGS = [
  "していた",
  "している",
  "してる",
  "されている",
  "されていた",
  "して",
  "した",
  "ます",
  "ません",
  "ました",
  "でした",
  "である",
  "だった",
  "だったら",
  "ではない",
  "じゃない",
  "られる",
  "れる",
  "ない",
  "たい",
  "やすい",
  "にくい",
  "そう",
  "よう",
] as const;

const PLAIN_VERB_ENDINGS = ["う", "く", "ぐ", "す", "つ", "ぬ", "ぶ", "む", "る", "い", "た", "て", "だ", "で"] as const;

function extractPreviousToken(text: string, index: number) {
  const before = text.slice(0, index).trimEnd();
  const match = before.match(/[一-龠々ぁ-んァ-ヶーA-Za-z0-9]+$/);
  return match?.[0] ?? "";
}

function isLikelyNoun(token: string) {
  if (!token) return false;
  if (CONJUGATION_ENDINGS.some((ending) => token.endsWith(ending))) {
    return false;
  }
  if (PLAIN_VERB_ENDINGS.some((ending) => token.endsWith(ending))) {
    return false;
  }
  return true;
}

function detectBadConnectors(text: string): Detection[] {
  const detections: Detection[] = [];
  const regex = /(し、|り、|て、|が、)/g;

  for (const match of text.matchAll(regex)) {
    const found = match[0];
    const index = match.index ?? 0;
    const connector = found[0];

    if (connector === "が") {
      const previousToken = extractPreviousToken(text, index);
      if (isLikelyNoun(previousToken)) {
        continue;
      }
    }

    detections.push({
      connector,
      start: index,
      end: index + found.length,
    });
  }

  return detections;
}

function SelfCheckButtons({
  value,
  onChange,
}: {
  value: boolean | null;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex gap-2">
      <button
        type="button"
        onClick={() => onChange(true)}
        className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
          value === true
            ? "bg-emerald-600 text-white"
            : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
        }`}
      >
        Yes
      </button>
      <button
        type="button"
        onClick={() => onChange(false)}
        className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
          value === false
            ? "bg-rose-600 text-white"
            : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
        }`}
      >
        No
      </button>
    </div>
  );
}

export default function ConnectorWork({ onSave, isLoading = false }: Props) {
  const [selectedOriginal, setSelectedOriginal] = useState<(typeof PRESETS)[number] | "">("");
  const [rewritten, setRewritten] = useState("");
  const [selfCheck, setSelfCheck] = useState<SelfCheckState>({
    eliminated: null,
    causalClear: null,
    claimClear: null,
  });
  const [validationError, setValidationError] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [showExample, setShowExample] = useState(false);

  const detections = useMemo(() => detectBadConnectors(rewritten), [rewritten]);

  const highlightedPreview = useMemo(() => {
    if (!rewritten) {
      return <span className="text-slate-400">ここに書き換え文のプレビューが表示されます</span>;
    }

    if (detections.length === 0) {
      return <span className="whitespace-pre-wrap text-slate-700">{rewritten}</span>;
    }

    const nodes: ReactNode[] = [];
    let cursor = 0;

    detections.forEach((detection, index) => {
      if (cursor < detection.start) {
        nodes.push(
          <span key={`plain-${index}`} className="whitespace-pre-wrap text-slate-700">
            {rewritten.slice(cursor, detection.start)}
          </span>,
        );
      }

      nodes.push(
        <span
          key={`hit-${index}`}
          className="whitespace-pre-wrap rounded-md bg-rose-100 px-1 py-0.5 font-semibold text-rose-700"
        >
          {rewritten.slice(detection.start, detection.end)}
        </span>,
      );

      cursor = detection.end;
    });

    if (cursor < rewritten.length) {
      nodes.push(
        <span key="plain-last" className="whitespace-pre-wrap text-slate-700">
          {rewritten.slice(cursor)}
        </span>,
      );
    }

    return nodes;
  }, [detections, rewritten]);

  const remainingBadConnectors = useMemo(
    () => detections.map((detection) => detection.connector),
    [detections],
  );

  const handleSave = () => {
    if (!selectedOriginal) {
      setValidationError("お題を選択してください");
      return;
    }
    if (!rewritten.trim()) {
      setValidationError("書き換え文を入力してください");
      return;
    }
    if (
      selfCheck.eliminated === null ||
      selfCheck.causalClear === null ||
      selfCheck.claimClear === null
    ) {
      setValidationError("セルフチェックをすべて選択してください");
      return;
    }

    setValidationError("");
    setShowSuccess(true);
    setTimeout(() => {
      onSave({
        original: selectedOriginal,
        rewritten: rewritten.trim(),
        remainingBadConnectors,
        selfCheck: {
          eliminated: selfCheck.eliminated ?? false,
          causalClear: selfCheck.causalClear ?? false,
          claimClear: selfCheck.claimClear ?? false,
        },
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
          <p className="text-sm font-semibold text-indigo-600">ワークの狙い</p>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            「し・り・て・が」で話をつなぐと、因果関係や主張の芯がぼやけやすくなります。
            接続詞を明示して、読み手が一度で意図を追える文に整えましょう。
          </p>
          <button
            type="button"
            onClick={() => setShowExample((current) => !current)}
            className="mt-3 flex w-full items-center justify-between text-left"
          >
            <span className="flex items-center gap-2 text-sm font-semibold text-indigo-600">
              <Eye className="h-4 w-4" />
              {selectedOriginal && CONNECTOR_EXAMPLES[selectedOriginal] ? "このお題の回答例を見る" : "回答例を見る"}
            </span>
            {showExample ? (
              <ChevronUp className="h-4 w-4 text-indigo-400" />
            ) : (
              <ChevronDown className="h-4 w-4 text-indigo-400" />
            )}
          </button>
          {showExample && (() => {
            const exampleKey = selectedOriginal || PRESETS[0];
            const exampleRewrite = CONNECTOR_EXAMPLES[exampleKey];
            if (!exampleRewrite) return null;
            return (
              <div className="mt-4 space-y-3">
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
                  <p className="text-xs font-bold text-amber-700">元の文（悪い例）</p>
                  <p className="mt-2 text-sm text-slate-700">{exampleKey}</p>
                </div>
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3">
                  <p className="text-xs font-bold text-emerald-700">書き換え例（良い例）</p>
                  <p className="mt-2 text-sm text-slate-700">{exampleRewrite}</p>
                </div>
                <p className="text-xs text-slate-400">
                  「だから」「したがって」「一方で」など、論理的な接続詞で因果関係を明示しています。
                </p>
              </div>
            );
          })()}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm font-semibold text-indigo-600">Step 1</p>
          <h2 className="mt-1 text-lg font-semibold text-slate-900">お題を選ぶ</h2>
          <p className="mt-1 text-sm text-slate-500">
            「しりてが」を含む悪い例文から1つ選び、論理的な文に書き換えます。
          </p>
          <div className="mt-4 space-y-3">
            {PRESETS.map((preset, index) => {
              const isSelected = selectedOriginal === preset;
              return (
                <button
                  key={preset}
                  type="button"
                  onClick={() => {
                    setSelectedOriginal(preset);
                    setValidationError("");
                  }}
                  className={`w-full rounded-2xl border px-4 py-3 text-left text-sm transition ${
                    isSelected
                      ? "border-indigo-600 bg-indigo-50 text-indigo-900 ring-2 ring-indigo-100"
                      : "border-slate-200 bg-white text-slate-700 hover:border-indigo-200 hover:bg-indigo-50/40"
                  }`}
                >
                  <span className="text-xs font-semibold text-slate-400">お題 {index + 1}</span>
                  <p className="mt-1 leading-6">{preset}</p>
                </button>
              );
            })}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm font-semibold text-indigo-600">Step 2</p>
          <h2 className="mt-1 text-lg font-semibold text-slate-900">論理的な接続詞で書き換える</h2>
          <p className="mt-1 text-sm text-slate-500">
            因果、対比、要約が伝わるように接続詞を明示してください。
          </p>

          <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-xs font-bold text-slate-500">元の文</p>
            <p className="mt-2 min-h-12 text-sm leading-6 text-slate-700">
              {selectedOriginal || "まずは Step 1 でお題を選択してください"}
            </p>
          </div>

          <div className="mt-4 rounded-2xl border border-dashed border-indigo-200 bg-white p-4">
            <p className="text-xs font-bold text-slate-500">使える接続詞のヒント</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {GOOD_CONNECTORS.map((connector) => (
                <span
                  key={connector}
                  className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700"
                >
                  {connector}
                </span>
              ))}
            </div>
          </div>

          <textarea
            value={rewritten}
            onChange={(event) => {
              setRewritten(event.target.value);
              setValidationError("");
            }}
            placeholder="例: 売上が下がり、コストが上がっている。その結果、利益が減っている。したがって、まず粗利改善策を優先すべきだ。"
            rows={6}
            className="mt-4 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100"
          />

          <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_260px]">
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-slate-900">リアルタイム検出</p>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    detections.length === 0
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-rose-50 text-rose-700"
                  }`}
                >
                  {detections.length === 0
                    ? "曖昧接続なし"
                    : `${detections.length}件の曖昧接続を検出`}
                </span>
              </div>
              <div className="mt-3 min-h-24 rounded-xl bg-slate-50 p-3 text-sm leading-7">
                {highlightedPreview}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                <AlertTriangle className="h-4 w-4 text-rose-500" />
                検出結果
              </div>
              {remainingBadConnectors.length === 0 ? (
                <p className="mt-3 text-sm text-slate-500">現在は検出されていません。</p>
              ) : (
                <div className="mt-3 flex flex-wrap gap-2">
                  {remainingBadConnectors.map((connector, index) => (
                    <span
                      key={`${connector}-${index}`}
                      className="rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700"
                    >
                      {connector}
                    </span>
                  ))}
                </div>
              )}
              <p className="mt-4 text-xs leading-5 text-slate-400">
                「し、」「り、」「て、」「が、」を検出します。
                「新システムが、」のような主語マーカーの「が」は、直前語を見て除外します。
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm font-semibold text-indigo-600">Step 3</p>
          <h2 className="mt-1 text-lg font-semibold text-slate-900">セルフチェック</h2>
          <div className="mt-4 space-y-4">
            <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    「し」「り」「て」「が」を全て排除できたか？
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    自動判定: {detections.length === 0 ? "Yes" : "No"}
                  </p>
                </div>
                <SelfCheckButtons
                  value={selfCheck.eliminated}
                  onChange={(value) => {
                    setSelfCheck((current) => ({ ...current, eliminated: value }));
                    setValidationError("");
                  }}
                />
              </div>
            </div>

            <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-900">因果関係が明確になったか？</p>
                  <p className="mt-1 text-xs text-slate-500">
                    原因・結果・対比のどれなのかを読み手が迷わない状態を目指します。
                  </p>
                </div>
                <SelfCheckButtons
                  value={selfCheck.causalClear}
                  onChange={(value) => {
                    setSelfCheck((current) => ({ ...current, causalClear: value }));
                    setValidationError("");
                  }}
                />
              </div>
            </div>

            <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    文を読んだ相手が、筆者の主張を1つに特定できるか？
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    最後に何を言いたい文なのかが一読で決まるかを確認します。
                  </p>
                </div>
                <SelfCheckButtons
                  value={selfCheck.claimClear}
                  onChange={(value) => {
                    setSelfCheck((current) => ({ ...current, claimClear: value }));
                    setValidationError("");
                  }}
                />
              </div>
            </div>
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
