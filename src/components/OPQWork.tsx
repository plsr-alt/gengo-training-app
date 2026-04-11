"use client";

import { Check, ChevronDown, ChevronUp, Eye, Save } from "lucide-react";
import { useState } from "react";

export interface OPQContent {
  scenario: string;
  objective: string;
  problem: string;
  question: string;
  selfCheck: { measurable: boolean; gapClear: boolean; actionable: boolean };
}

interface Props {
  onSave: (content: OPQContent) => void;
  isLoading?: boolean;
}

const PRESET_SCENARIOS = [
  "自社ECサイトの月間売上が前年比20%減少している",
  "新入社員の3ヶ月以内離職率が30%を超えた",
  "主力製品の顧客満足度が業界平均を下回っている",
  "社内会議の平均所要時間が1.5時間で参加者の満足度が低い",
  "営業チームの新規顧客獲得数が2四半期連続で目標未達",
] as const;

type CheckKey = keyof OPQContent["selfCheck"];

const CHECK_ITEMS: Array<{
  key: CheckKey;
  label: string;
  hint: string;
}> = [
  {
    key: "measurable",
    label: "Oは具体的で測定可能か？",
    hint: "数字・期限・状態が入っていると明確になります。",
  },
  {
    key: "gapClear",
    label: "PはOとのギャップを明確に示しているか？",
    hint: "現状がどこまで足りていないかを書けているか確認します。",
  },
  {
    key: "actionable",
    label: "QはPを解決する行動につながる問いか？",
    hint: "考えるだけでなく、次の調査や打ち手に進める問いになっているか見ます。",
  },
];

export default function OPQWork({ onSave, isLoading = false }: Props) {
  const [scenario, setScenario] = useState("");
  const [objective, setObjective] = useState("");
  const [problem, setProblem] = useState("");
  const [question, setQuestion] = useState("");
  const [selfCheck, setSelfCheck] = useState<OPQContent["selfCheck"]>({
    measurable: false,
    gapClear: false,
    actionable: false,
  });
  const [validationError, setValidationError] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [showExample, setShowExample] = useState(false);

  const setCheckValue = (key: CheckKey, value: boolean) => {
    setSelfCheck((current) => ({ ...current, [key]: value }));
    setValidationError("");
  };

  const handleSave = () => {
    const trimmedScenario = scenario.trim();
    const trimmedObjective = objective.trim();
    const trimmedProblem = problem.trim();
    const trimmedQuestion = question.trim();

    if (!trimmedScenario) {
      setValidationError("シナリオを選択または入力してください");
      return;
    }
    if (!trimmedObjective) {
      setValidationError("O（望ましい状態）を入力してください");
      return;
    }
    if (!trimmedProblem) {
      setValidationError("P（問題）を入力してください");
      return;
    }
    if (!trimmedQuestion) {
      setValidationError("Q（解くべき問い）を入力してください");
      return;
    }

    setValidationError("");
    setShowSuccess(true);
    setTimeout(() => {
      onSave({
        scenario: trimmedScenario,
        objective: trimmedObjective,
        problem: trimmedProblem,
        question: trimmedQuestion,
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
                <p className="text-xs font-bold text-slate-500">シナリオ</p>
                <p className="mt-1 text-sm text-slate-800">
                  自社ECサイトの月間売上が前年比20%減少している
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3">
                  <p className="text-xs font-bold text-emerald-700">O</p>
                  <p className="mt-2 text-sm text-slate-700">
                    3ヶ月以内に月間売上を前年同月比100%以上へ回復させる。
                  </p>
                </div>
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
                  <p className="text-xs font-bold text-amber-700">P</p>
                  <p className="mt-2 text-sm text-slate-700">
                    集客数、購入率、客単価のどこで落ちているか不明で、改善対象が定まっていない。
                  </p>
                </div>
                <div className="rounded-xl border border-sky-200 bg-sky-50 p-3">
                  <p className="text-xs font-bold text-sky-700">Q</p>
                  <p className="mt-2 text-sm text-slate-700">
                    売上減少の主要因は流入減か、CVR低下か、リピート率低下か？
                  </p>
                </div>
              </div>
              <p className="text-xs text-slate-400">
                Oで目標を置き、Pでギャップを定義し、Qで解くべき問いに変換します。
              </p>
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm font-semibold text-indigo-600">Step 1</p>
          <label htmlFor="opq-scenario" className="mt-1 block text-lg font-semibold text-slate-900">
            シナリオを選ぶ
          </label>
          <p className="mt-1 text-sm text-slate-500">
            プリセットから選ぶか、自由入力でビジネスシーンを書いてください。
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {PRESET_SCENARIOS.map((preset) => {
              const isSelected = scenario === preset;
              return (
                <button
                  key={preset}
                  type="button"
                  onClick={() => {
                    setScenario(preset);
                    setValidationError("");
                  }}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                    isSelected
                      ? "bg-indigo-600 text-white"
                      : "border border-slate-200 bg-white text-slate-700 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600"
                  }`}
                >
                  {preset}
                </button>
              );
            })}
          </div>
          <textarea
            id="opq-scenario"
            value={scenario}
            onChange={(event) => {
              setScenario(event.target.value);
              setValidationError("");
            }}
            placeholder="例: 新サービスのトライアル登録数は多いが、有料転換率が低い"
            rows={4}
            aria-required="true"
            className="mt-4 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100"
          />
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm font-semibold text-indigo-600">Step 2</p>
          <label htmlFor="opq-objective" className="mt-1 block text-lg font-semibold text-slate-900">
            O（Objective / 望ましい状態）
          </label>
          <p className="mt-1 text-sm text-slate-500">
            ヒント: 最終的にどうなっていれば良いか？
          </p>
          <textarea
            id="opq-objective"
            value={objective}
            onChange={(event) => {
              setObjective(event.target.value);
              setValidationError("");
            }}
            placeholder="例: 半年以内に新規顧客獲得数を四半期100件まで回復させる"
            rows={4}
            aria-required="true"
            className="mt-3 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100"
          />
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm font-semibold text-indigo-600">Step 3</p>
          <label htmlFor="opq-problem" className="mt-1 block text-lg font-semibold text-slate-900">
            P（Problem / 問題）
          </label>
          <p className="mt-1 text-sm text-slate-500">
            ヒント: 望ましい状態と現状のギャップは何か？
          </p>
          <textarea
            id="opq-problem"
            value={problem}
            onChange={(event) => {
              setProblem(event.target.value);
              setValidationError("");
            }}
            placeholder="例: 商談数は確保できているが、初回提案後の失注率が高く目標件数に届いていない"
            rows={4}
            aria-required="true"
            className="mt-3 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100"
          />
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm font-semibold text-indigo-600">Step 4</p>
          <label htmlFor="opq-question" className="mt-1 block text-lg font-semibold text-slate-900">
            Q（Question / 解くべき問い）
          </label>
          <p className="mt-1 text-sm text-slate-500">
            ヒント: この問題を解決するために、何に答える必要があるか？
          </p>
          <textarea
            id="opq-question"
            value={question}
            onChange={(event) => {
              setQuestion(event.target.value);
              setValidationError("");
            }}
            placeholder="例: 失注率が高い主因は提案内容か、ターゲットのズレか、営業プロセスの遅さか？"
            rows={4}
            aria-required="true"
            className="mt-3 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100"
          />
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm font-semibold text-indigo-600">Step 5</p>
          <h2 className="mt-1 text-lg font-semibold text-slate-900">OPQの整合性セルフチェック</h2>
          <p className="mt-1 text-sm text-slate-500">
            Yes/No で確認して、問いの精度を上げましょう。
          </p>

          <div className="mt-4 space-y-3">
            {CHECK_ITEMS.map((item) => (
              <div
                key={item.key}
                className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{item.label}</p>
                    <p className="mt-1 text-sm text-slate-500">{item.hint}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setCheckValue(item.key, true)}
                      className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                        selfCheck[item.key]
                          ? "bg-emerald-600 text-white"
                          : "border border-slate-200 bg-white text-slate-700 hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
                      }`}
                    >
                      Yes
                    </button>
                    <button
                      type="button"
                      onClick={() => setCheckValue(item.key, false)}
                      className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                        !selfCheck[item.key]
                          ? "bg-rose-600 text-white"
                          : "border border-slate-200 bg-white text-slate-700 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700"
                      }`}
                    >
                      No
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {validationError && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
            {validationError}
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleSave}
            disabled={isLoading}
            className="inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-300"
          >
            <Save className="h-4 w-4" />
            {isLoading ? "保存中..." : "保存する"}
          </button>
        </div>
      </div>
    </section>
  );
}
