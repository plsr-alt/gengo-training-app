"use client";

import { ArrowDown, Check, GitBranch, Plus, Save, Trash2 } from "lucide-react";
import { useState } from "react";

export interface CausalMapContent {
  theme: string;
  nodes: { id: string; text: string }[];
  edges: { from: string; to: string }[];
}

interface Props {
  onSave: (content: CausalMapContent) => void;
  isLoading?: boolean;
}

function generateId(): string {
  return crypto.randomUUID();
}

export default function CausalMapWork({ onSave, isLoading = false }: Props) {
  const [theme, setTheme] = useState("");
  const [nodes, setNodes] = useState<{ id: string; text: string }[]>([]);
  const [edges, setEdges] = useState<{ from: string; to: string }[]>([]);
  const [inputText, setInputText] = useState("");
  const [promptMode, setPromptMode] = useState<"deeper" | "branch" | null>(null);
  const [branchFromId, setBranchFromId] = useState<string | null>(null);
  const [validationError, setValidationError] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  const addNode = (text: string, parentId?: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    const newNode = { id: generateId(), text: trimmed };
    setNodes((prev) => [...prev, newNode]);

    if (parentId) {
      setEdges((prev) => [...prev, { from: parentId, to: newNode.id }]);
    } else if (nodes.length > 0) {
      const lastNode = nodes[nodes.length - 1];
      setEdges((prev) => [...prev, { from: lastNode.id, to: newNode.id }]);
    }

    setInputText("");
    setPromptMode(null);
    setBranchFromId(null);
    setValidationError("");
  };

  const removeNode = (id: string) => {
    setNodes((prev) => prev.filter((n) => n.id !== id));
    setEdges((prev) => prev.filter((e) => e.from !== id && e.to !== id));
  };

  const handleDeeper = () => {
    if (nodes.length === 0) return;
    setPromptMode("deeper");
    setBranchFromId(null);
    setInputText("");
  };

  const handleBranch = () => {
    if (nodes.length === 0) return;
    const lastNode = nodes[nodes.length - 1];
    setPromptMode("branch");
    setBranchFromId(lastNode.id);
    setInputText("");
  };

  const handleSubmitInput = () => {
    if (promptMode === "branch" && branchFromId) {
      const parentEdge = edges.find((e) => e.to === branchFromId);
      const parentId = parentEdge ? parentEdge.from : undefined;
      addNode(inputText, parentId);
    } else {
      addNode(inputText);
    }
  };

  const handleSave = () => {
    const trimmedTheme = theme.trim();
    if (!trimmedTheme) {
      setValidationError("テーマを入力してください");
      return;
    }
    if (nodes.length === 0) {
      setValidationError("少なくとも1つのノードを追加してください");
      return;
    }
    setValidationError("");
    setShowSuccess(true);
    setTimeout(() => {
      onSave({ theme: trimmedTheme, nodes, edges });
    }, 1200);
  };

  const getPromptLabel = () => {
    if (promptMode === "deeper") {
      const lastNode = nodes[nodes.length - 1];
      return `「${lastNode.text}」はなぜ？ もう一段深く考えてみましょう。`;
    }
    if (promptMode === "branch" && branchFromId) {
      const branchNode = nodes.find((n) => n.id === branchFromId);
      const parentEdge = edges.find((e) => e.to === branchFromId);
      const parentNode = parentEdge ? nodes.find((n) => n.id === parentEdge.from) : null;
      if (parentNode) {
        return `「${parentNode.text}」の別の説明は？ 「${branchNode?.text}」以外の原因を考えてみましょう。`;
      }
      return "別の説明を入力してください。";
    }
    return "原因や理由を入力してください。";
  };

  // Build a simple linear + branch display
  const rootNodes = nodes.filter(
    (n) => !edges.some((e) => e.to === n.id)
  );

  const getChildren = (nodeId: string) =>
    edges.filter((e) => e.from === nodeId).map((e) => nodes.find((n) => n.id === e.to)).filter(Boolean) as { id: string; text: string }[];

  const renderNode = (node: { id: string; text: string }, depth: number): React.ReactNode => {
    const children = getChildren(node.id);
    return (
      <div key={node.id} className="flex flex-col items-center">
        <div
          className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
          style={{ marginLeft: depth > 0 ? `${depth * 16}px` : undefined }}
        >
          <div className="flex items-start justify-between gap-3">
            <p className="text-sm text-slate-700 break-words">{node.text}</p>
            <button
              type="button"
              onClick={() => removeNode(node.id)}
              className="shrink-0 rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              aria-label={`ノード「${node.text}」を削除`}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
        {children.length > 0 && (
          <>
            <ArrowDown className="my-2 h-5 w-5 text-indigo-400" />
            <div className={`flex flex-col gap-3 ${children.length > 1 ? "items-start" : "items-center"} w-full`}>
              {children.map((child, i) => (
                <div key={child.id} className="w-full flex flex-col items-center">
                  {children.length > 1 && (
                    <span className="mb-1 text-xs font-medium text-slate-400">
                      {i === 0 ? "主因" : `別の説明 ${i}`}
                    </span>
                  )}
                  {renderNode(child, depth)}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    );
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
        {/* Step 1: Theme */}
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm font-semibold text-indigo-600">Step 1</p>
          <label htmlFor="causal-theme" className="mt-1 block text-lg font-semibold text-slate-900">
            テーマを設定する
          </label>
          <p className="mt-1 text-sm text-slate-500">
            深掘りしたい出来事や課題を書いてください。「なぜ？」を繰り返して原因を探ります。
          </p>
          <textarea
            id="causal-theme"
            value={theme}
            onChange={(e) => { setTheme(e.target.value); setValidationError(""); }}
            placeholder="例: プロジェクトの納期が遅れた"
            rows={3}
            aria-required="true"
            className="mt-3 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100"
          />
        </div>

        {/* Step 2: Build flow */}
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm font-semibold text-indigo-600">Step 2</p>
          <h2 className="mt-1 text-lg font-semibold text-slate-900">なぜなぜフローを作る</h2>
          <p className="mt-1 text-sm text-slate-500">
            原因を追加して、矢印でつなげていきましょう。
          </p>

          {/* Flow visualization */}
          {nodes.length > 0 && (
            <div className="mt-4 flex flex-col items-center gap-2 rounded-2xl border border-slate-200 bg-white p-4" aria-label="なぜなぜフロー図">
              {rootNodes.map((node) => renderNode(node, 0))}
            </div>
          )}

          {nodes.length === 0 && (
            <div className="mt-4 rounded-xl border border-dashed border-slate-300 px-4 py-8 text-center text-sm text-slate-400">
              まだノードがありません。最初の原因を追加してください。
            </div>
          )}

          {/* Input area */}
          <div className="mt-4 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
            {promptMode && (
              <p className="mb-3 text-sm font-medium text-indigo-600">
                {getPromptLabel()}
              </p>
            )}
            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") { e.preventDefault(); handleSubmitInput(); }
                }}
                placeholder={promptMode === "deeper" ? "なぜそうなった？" : promptMode === "branch" ? "別の原因は？" : "原因・理由を入力"}
                aria-label="ノードのテキスト入力"
                className="min-w-0 flex-1 rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100"
              />
              <button
                type="button"
                onClick={handleSubmitInput}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700"
              >
                <Plus className="h-4 w-4" />
                追加
              </button>
            </div>
          </div>

          {/* Action buttons */}
          {nodes.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleDeeper}
                className="inline-flex items-center gap-2 rounded-xl border border-indigo-200 bg-white px-4 py-2 text-sm font-semibold text-indigo-600 transition hover:bg-indigo-50"
                aria-label="もう一段深く掘り下げる"
              >
                <ArrowDown className="h-4 w-4" />
                もう一段深く
              </button>
              <button
                type="button"
                onClick={handleBranch}
                className="inline-flex items-center gap-2 rounded-xl border border-indigo-200 bg-white px-4 py-2 text-sm font-semibold text-indigo-600 transition hover:bg-indigo-50"
                aria-label="別の説明を追加する"
              >
                <GitBranch className="h-4 w-4" />
                他の説明は？
              </button>
            </div>
          )}
        </div>

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
