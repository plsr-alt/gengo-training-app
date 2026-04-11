'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, AlertTriangle } from 'lucide-react';
import {
  getWork,
  type Work,
  type FactEmotionContent,
  type CausalMapContent,
  type TranslateContent,
  type PyramidContent,
  type OPQContent,
  type ConnectorContent,
  updateWork,
} from '@/lib/storage';
import ShareButton from '@/components/ShareButton';

function buildShareText(work: Work): string {
  const typeLabels: Record<string, string> = {
    fact_emotion: '事実/感情仕分け',
    causal_map: '因果関係マッピング',
    translate: '小5翻訳チャレンジ',
    pyramid: 'ピラミッド構造',
    opq: 'OPQ分析',
    connector: 'しりてが撲滅',
  };
  const label = typeLabels[work.workType] || work.workType;

  if (work.workType === 'fact_emotion') {
    const c = work.content as FactEmotionContent;
    return `【${label}】${c.trigger}\n事実${c.facts.length}件 / 感情${c.emotions.length}件を整理しました #言語化トレーニング`;
  }
  if (work.workType === 'translate') {
    const c = work.content as TranslateContent;
    return `【${label}】「${c.term}」をやさしく言い換え！スコア: ${c.score}/100 #言語化トレーニング`;
  }
  if (work.workType === 'causal_map') {
    const c = work.content as CausalMapContent;
    return `【${label}】「${c.theme}」の因果関係を${c.nodes.length}個のノードで整理しました #言語化トレーニング`;
  }
  if (work.workType === 'pyramid') {
    const c = work.content as PyramidContent;
    return `【${label}】「${c.topic}」について結論と理由${c.reasons.length}件を整理しました #言語化トレーニング`;
  }
  if (work.workType === 'opq') {
    const c = work.content as OPQContent;
    return `【${label}】「${c.scenario}」をO/P/Qで整理しました #言語化トレーニング`;
  }
  if (work.workType === 'connector') {
    const c = work.content as ConnectorContent;
    return `【${label}】接続のあいまいさを見直して文章を書き換えました「${c.rewritten.slice(0, 30)}${c.rewritten.length > 30 ? '...' : ''}」 #言語化トレーニング`;
  }
  return `言語化トレーニングでワークに取り組みました #言語化トレーニング`;
}

export default function WorkDetailPage() {
  const params = useParams();
  const [work, setWork] = useState<Work | null>(null);
  const [mounted, setMounted] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [draftContent, setDraftContent] = useState<Work['content'] | null>(null);

  useEffect(() => {
    setMounted(true);
    const id = params.id as string;
    const found = getWork(id);
    setWork(found ?? null);
    setDraftContent(found?.content ?? null);
  }, [params.id]);

  const startEditing = () => {
    if (!work) return;
    setDraftContent(structuredClone(work.content));
    setIsEditing(true);
  };

  const cancelEditing = () => {
    if (!work) return;
    setDraftContent(structuredClone(work.content));
    setIsEditing(false);
  };

  const saveEditing = () => {
    if (!work || !draftContent) return;
    const updated = updateWork(work.id, { content: draftContent });
    if (!updated) return;
    setWork(updated);
    setDraftContent(structuredClone(updated.content));
    setIsEditing(false);
  };

  const updateDraftContent = (updater: (current: Work['content']) => Work['content']) => {
    setDraftContent((current) => {
      if (!current) return current;
      return updater(current);
    });
  };

  const renderBooleanBadge = (value: boolean) => (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
        value ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'
      }`}
    >
      {value ? 'Yes' : 'No'}
    </span>
  );

  const renderEditActions = () => (
    <div className="flex gap-3">
      {isEditing ? (
        <>
          <button
            type="button"
            onClick={saveEditing}
            className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700"
          >
            保存
          </button>
          <button
            type="button"
            onClick={cancelEditing}
            className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-200"
          >
            キャンセル
          </button>
        </>
      ) : (
        <button
          type="button"
          onClick={startEditing}
          className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          編集する
        </button>
      )}
    </div>
  );

  const renderCheckItem = (label: string, value: boolean) => (
    <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
      <span className="text-sm text-slate-700">{label}</span>
      {renderBooleanBadge(value)}
    </div>
  );

  const renderBooleanField = (
    label: string,
    value: boolean,
    onChange: (next: boolean) => void,
  ) => (
    <label className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
      <span className="text-sm text-slate-700">{label}</span>
      <select
        value={value ? 'yes' : 'no'}
        onChange={(e) => onChange(e.target.value === 'yes')}
        className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none ring-0"
      >
        <option value="yes">Yes</option>
        <option value="no">No</option>
      </select>
    </label>
  );

  if (!mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-slate-400">読み込み中...</div>
      </div>
    );
  }

  if (!work) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50">
        <p className="text-slate-500">ワークが見つかりません</p>
        <Link href="/history" className="mt-4 text-indigo-600 hover:underline">履歴に戻る</Link>
      </div>
    );
  }

  const renderFactEmotion = (content: FactEmotionContent) => {
    const draft = draftContent as FactEmotionContent | null;

    return (
      <>
        {renderEditActions()}
        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <h2 className="text-sm font-semibold text-indigo-600">心が動いた出来事</h2>
          {isEditing && draft ? (
            <textarea
              value={draft.trigger}
              onChange={(e) => updateDraftContent((current) => ({ ...(current as FactEmotionContent), trigger: e.target.value }))}
              className="mt-2 min-h-28 w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-700 outline-none"
            />
          ) : (
            <p className="mt-2 whitespace-pre-wrap text-slate-700">{content.trigger}</p>
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <h2 className="text-sm font-semibold text-indigo-600">事実</h2>
            {isEditing && draft ? (
              <textarea
                value={draft.facts.join('\n')}
                onChange={(e) =>
                  updateDraftContent((current) => ({
                    ...(current as FactEmotionContent),
                    facts: e.target.value.split('\n'),
                  }))
                }
                className="mt-3 min-h-40 w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-700 outline-none"
              />
            ) : (
              <ul className="mt-3 space-y-2">
                {content.facts.map((fact, i) => (
                  <li key={i} className="text-sm text-slate-700">• {fact}</li>
                ))}
                {content.facts.length === 0 && <li className="text-sm text-slate-400">なし</li>}
              </ul>
            )}
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <h2 className="text-sm font-semibold text-indigo-600">感情</h2>
            {isEditing && draft ? (
              <>
                <textarea
                  value={draft.emotions.join('\n')}
                  onChange={(e) =>
                    updateDraftContent((current) => ({
                      ...(current as FactEmotionContent),
                      emotions: e.target.value.split('\n'),
                    }))
                  }
                  className="mt-3 min-h-40 w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-700 outline-none"
                />
                <p className="mt-2 text-xs text-slate-500">思い込みインデックスは既存値を保持します。</p>
              </>
            ) : (
              <ul className="mt-3 space-y-2">
                {content.emotions.map((emotion, i) => {
                  const isAssumption = content.assumptions.includes(i);
                  return (
                    <li key={i} className={`flex items-start gap-2 text-sm ${isAssumption ? 'text-orange-700' : 'text-slate-700'}`}>
                      {isAssumption && <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-orange-500" />}
                      <span>• {emotion}</span>
                    </li>
                  );
                })}
                {content.emotions.length === 0 && <li className="text-sm text-slate-400">なし</li>}
              </ul>
            )}
          </div>
        </div>

        {content.assumptions.length > 0 && !isEditing && (
          <div className="rounded-2xl border border-orange-200 bg-orange-50 p-4">
            <p className="text-sm font-semibold text-orange-700">
              思い込みの可能性がある項目: {content.assumptions.length}件
            </p>
            <p className="mt-1 text-sm text-orange-600">
              オレンジ色の項目は、事実と混同している可能性があります。もう一度振り返ってみましょう。
            </p>
          </div>
        )}
      </>
    );
  };

  const renderCausalMap = (content: CausalMapContent) => {
    const draft = draftContent as CausalMapContent | null;

    return (
      <>
        {renderEditActions()}
        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <h2 className="text-sm font-semibold text-indigo-600">テーマ</h2>
          {isEditing && draft ? (
            <textarea
              value={draft.theme}
              onChange={(e) => updateDraftContent((current) => ({ ...(current as CausalMapContent), theme: e.target.value }))}
              className="mt-2 min-h-28 w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-700 outline-none"
            />
          ) : (
            <p className="mt-2 whitespace-pre-wrap text-slate-700">{content.theme}</p>
          )}
        </div>
        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <h2 className="text-sm font-semibold text-indigo-600">ノード ({content.nodes.length}件)</h2>
          {isEditing && draft ? (
            <textarea
              value={draft.nodes.map((node) => node.text).join('\n')}
              onChange={(e) =>
                updateDraftContent((current) => ({
                  ...(current as CausalMapContent),
                  nodes: e.target.value.split('\n').map((text, index) => ({
                    id: (current as CausalMapContent).nodes[index]?.id ?? crypto.randomUUID(),
                    text,
                  })),
                }))
              }
              className="mt-3 min-h-40 w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-700 outline-none"
            />
          ) : (
            <ul className="mt-3 space-y-2">
              {content.nodes.map((node) => (
                <li key={node.id} className="text-sm text-slate-700">• {node.text}</li>
              ))}
            </ul>
          )}
        </div>
      </>
    );
  };

  const renderTranslate = (content: TranslateContent) => {
    const draft = draftContent as TranslateContent | null;

    return (
      <>
        {renderEditActions()}
        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <h2 className="text-sm font-semibold text-indigo-600">お題</h2>
          {isEditing && draft ? (
            <textarea
              value={draft.term}
              onChange={(e) => updateDraftContent((current) => ({ ...(current as TranslateContent), term: e.target.value }))}
              className="mt-2 min-h-24 w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-700 outline-none"
            />
          ) : (
            <>
              <p className="mt-2 text-lg font-bold text-slate-900">{content.term}</p>
              <p className="mt-1 text-sm text-slate-500">難易度: {content.difficulty}</p>
            </>
          )}
        </div>
        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <h2 className="text-sm font-semibold text-indigo-600">あなたの説明</h2>
          {isEditing && draft ? (
            <textarea
              value={draft.answer}
              onChange={(e) => updateDraftContent((current) => ({ ...(current as TranslateContent), answer: e.target.value }))}
              className="mt-2 min-h-40 w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-700 outline-none"
            />
          ) : (
            <p className="mt-2 whitespace-pre-wrap text-slate-700">{content.answer}</p>
          )}
        </div>
        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <h2 className="text-sm font-semibold text-indigo-600">スコア</h2>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            {content.score}
            <span className="text-sm text-slate-400">/100</span>
          </p>
          {content.flaggedWords.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {content.flaggedWords.map((w) => (
                <span key={w} className="rounded-full bg-orange-100 px-3 py-1 text-xs font-medium text-orange-700">{w}</span>
              ))}
            </div>
          )}
        </div>
      </>
    );
  };

  const renderPyramid = (content: PyramidContent) => {
    const draft = draftContent as PyramidContent | null;

    return (
      <>
        {renderEditActions()}
        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <h2 className="text-sm font-semibold text-indigo-600">お題</h2>
          {isEditing && draft ? (
            <textarea
              value={draft.topic}
              onChange={(e) => updateDraftContent((current) => ({ ...(current as PyramidContent), topic: e.target.value }))}
              className="mt-2 min-h-24 w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-700 outline-none"
            />
          ) : (
            <p className="mt-2 whitespace-pre-wrap text-slate-700">{content.topic}</p>
          )}
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <h2 className="text-sm font-semibold text-indigo-600">結論</h2>
          {isEditing && draft ? (
            <textarea
              value={draft.conclusion}
              onChange={(e) => updateDraftContent((current) => ({ ...(current as PyramidContent), conclusion: e.target.value }))}
              className="mt-2 min-h-28 w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-700 outline-none"
            />
          ) : (
            <p className="mt-2 whitespace-pre-wrap text-slate-700">{content.conclusion}</p>
          )}
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <h2 className="text-sm font-semibold text-indigo-600">理由1-3</h2>
          {isEditing && draft ? (
            <textarea
              value={draft.reasons.join('\n')}
              onChange={(e) =>
                updateDraftContent((current) => ({
                  ...(current as PyramidContent),
                  reasons: e.target.value.split('\n'),
                }))
              }
              className="mt-3 min-h-40 w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-700 outline-none"
            />
          ) : (
            <ul className="mt-3 space-y-3">
              {content.reasons.map((reason, index) => (
                <li key={`${reason}-${index}`} className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
                  理由{index + 1}: {reason}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <h2 className="text-sm font-semibold text-indigo-600">セルフチェック結果</h2>
          <div className="mt-3 space-y-3">
            {isEditing && draft ? (
              <>
                {renderBooleanField('要約されている', draft.selfCheck.summarized, (next) =>
                  updateDraftContent((current) => ({
                    ...(current as PyramidContent),
                    selfCheck: { ...(current as PyramidContent).selfCheck, summarized: next },
                  }))
                )}
                {renderBooleanField('MECEになっている', draft.selfCheck.mece, (next) =>
                  updateDraftContent((current) => ({
                    ...(current as PyramidContent),
                    selfCheck: { ...(current as PyramidContent).selfCheck, mece: next },
                  }))
                )}
                {renderBooleanField('結論を直接支えている', draft.selfCheck.directSupport, (next) =>
                  updateDraftContent((current) => ({
                    ...(current as PyramidContent),
                    selfCheck: { ...(current as PyramidContent).selfCheck, directSupport: next },
                  }))
                )}
              </>
            ) : (
              <>
                {renderCheckItem('要約されている', content.selfCheck.summarized)}
                {renderCheckItem('MECEになっている', content.selfCheck.mece)}
                {renderCheckItem('結論を直接支えている', content.selfCheck.directSupport)}
              </>
            )}
          </div>
        </div>
      </>
    );
  };

  const renderOPQ = (content: OPQContent) => {
    const draft = draftContent as OPQContent | null;

    return (
      <>
        {renderEditActions()}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 md:col-span-2">
            <h2 className="text-sm font-semibold text-indigo-600">シナリオ</h2>
            {isEditing && draft ? (
              <textarea
                value={draft.scenario}
                onChange={(e) => updateDraftContent((current) => ({ ...(current as OPQContent), scenario: e.target.value }))}
                className="mt-2 min-h-28 w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-700 outline-none"
              />
            ) : (
              <p className="mt-2 whitespace-pre-wrap text-slate-700">{content.scenario}</p>
            )}
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <h2 className="text-sm font-semibold text-indigo-600">O: 望ましい状態</h2>
            {isEditing && draft ? (
              <textarea
                value={draft.objective}
                onChange={(e) => updateDraftContent((current) => ({ ...(current as OPQContent), objective: e.target.value }))}
                className="mt-2 min-h-32 w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-700 outline-none"
              />
            ) : (
              <p className="mt-2 whitespace-pre-wrap text-slate-700">{content.objective}</p>
            )}
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <h2 className="text-sm font-semibold text-indigo-600">P: 問題</h2>
            {isEditing && draft ? (
              <textarea
                value={draft.problem}
                onChange={(e) => updateDraftContent((current) => ({ ...(current as OPQContent), problem: e.target.value }))}
                className="mt-2 min-h-32 w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-700 outline-none"
              />
            ) : (
              <p className="mt-2 whitespace-pre-wrap text-slate-700">{content.problem}</p>
            )}
          </div>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <h2 className="text-sm font-semibold text-indigo-600">Q: 問い</h2>
          {isEditing && draft ? (
            <textarea
              value={draft.question}
              onChange={(e) => updateDraftContent((current) => ({ ...(current as OPQContent), question: e.target.value }))}
              className="mt-2 min-h-32 w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-700 outline-none"
            />
          ) : (
            <p className="mt-2 whitespace-pre-wrap text-slate-700">{content.question}</p>
          )}
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <h2 className="text-sm font-semibold text-indigo-600">セルフチェック結果</h2>
          <div className="mt-3 space-y-3">
            {isEditing && draft ? (
              <>
                {renderBooleanField('測定可能になっている', draft.selfCheck.measurable, (next) =>
                  updateDraftContent((current) => ({
                    ...(current as OPQContent),
                    selfCheck: { ...(current as OPQContent).selfCheck, measurable: next },
                  }))
                )}
                {renderBooleanField('ギャップが明確', draft.selfCheck.gapClear, (next) =>
                  updateDraftContent((current) => ({
                    ...(current as OPQContent),
                    selfCheck: { ...(current as OPQContent).selfCheck, gapClear: next },
                  }))
                )}
                {renderBooleanField('行動可能な問い', draft.selfCheck.actionable, (next) =>
                  updateDraftContent((current) => ({
                    ...(current as OPQContent),
                    selfCheck: { ...(current as OPQContent).selfCheck, actionable: next },
                  }))
                )}
              </>
            ) : (
              <>
                {renderCheckItem('測定可能になっている', content.selfCheck.measurable)}
                {renderCheckItem('ギャップが明確', content.selfCheck.gapClear)}
                {renderCheckItem('行動可能な問い', content.selfCheck.actionable)}
              </>
            )}
          </div>
        </div>
      </>
    );
  };

  const renderConnector = (content: ConnectorContent) => {
    const draft = draftContent as ConnectorContent | null;

    return (
      <>
        {renderEditActions()}
        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <h2 className="text-sm font-semibold text-indigo-600">元の文</h2>
          {isEditing && draft ? (
            <textarea
              value={draft.original}
              onChange={(e) => updateDraftContent((current) => ({ ...(current as ConnectorContent), original: e.target.value }))}
              className="mt-2 min-h-32 w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-700 outline-none"
            />
          ) : (
            <p className="mt-2 whitespace-pre-wrap text-slate-700">{content.original}</p>
          )}
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <h2 className="text-sm font-semibold text-indigo-600">書き換え後</h2>
          {isEditing && draft ? (
            <textarea
              value={draft.rewritten}
              onChange={(e) => updateDraftContent((current) => ({ ...(current as ConnectorContent), rewritten: e.target.value }))}
              className="mt-2 min-h-32 w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-700 outline-none"
            />
          ) : (
            <p className="mt-2 whitespace-pre-wrap text-slate-700">{content.rewritten}</p>
          )}
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <h2 className="text-sm font-semibold text-indigo-600">残った曖昧接続詞</h2>
          {isEditing && draft ? (
            <textarea
              value={draft.remainingBadConnectors.join('\n')}
              onChange={(e) =>
                updateDraftContent((current) => ({
                  ...(current as ConnectorContent),
                  remainingBadConnectors: e.target.value.split('\n').filter(Boolean),
                }))
              }
              className="mt-2 min-h-28 w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-700 outline-none"
            />
          ) : content.remainingBadConnectors.length > 0 ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {content.remainingBadConnectors.map((connector) => (
                <span
                  key={connector}
                  className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700"
                >
                  {connector}
                </span>
              ))}
            </div>
          ) : (
            <p className="mt-2 text-sm text-slate-500">なし</p>
          )}
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <h2 className="text-sm font-semibold text-indigo-600">セルフチェック結果</h2>
          <div className="mt-3 space-y-3">
            {isEditing && draft ? (
              <>
                {renderBooleanField('曖昧接続詞を除去できた', draft.selfCheck.eliminated, (next) =>
                  updateDraftContent((current) => ({
                    ...(current as ConnectorContent),
                    selfCheck: { ...(current as ConnectorContent).selfCheck, eliminated: next },
                  }))
                )}
                {renderBooleanField('因果関係が明確', draft.selfCheck.causalClear, (next) =>
                  updateDraftContent((current) => ({
                    ...(current as ConnectorContent),
                    selfCheck: { ...(current as ConnectorContent).selfCheck, causalClear: next },
                  }))
                )}
                {renderBooleanField('主張が明確', draft.selfCheck.claimClear, (next) =>
                  updateDraftContent((current) => ({
                    ...(current as ConnectorContent),
                    selfCheck: { ...(current as ConnectorContent).selfCheck, claimClear: next },
                  }))
                )}
              </>
            ) : (
              <>
                {renderCheckItem('曖昧接続詞を除去できた', content.selfCheck.eliminated)}
                {renderCheckItem('因果関係が明確', content.selfCheck.causalClear)}
                {renderCheckItem('主張が明確', content.selfCheck.claimClear)}
              </>
            )}
          </div>
        </div>
      </>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 py-6">
      <div className="mx-auto max-w-4xl px-4">
        <Link
          href="/history"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-indigo-600"
        >
          <ArrowLeft className="h-4 w-4" />
          履歴に戻る
        </Link>

        <h1 className="mb-2 text-2xl font-bold text-slate-900">{work.title}</h1>
        <p className="mb-6 text-sm text-slate-500">
          {new Intl.DateTimeFormat('ja-JP', { year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(work.createdAt))}
        </p>

        <div className="space-y-6">
          {work.workType === 'fact_emotion' && renderFactEmotion(work.content as FactEmotionContent)}
          {work.workType === 'causal_map' && renderCausalMap(work.content as CausalMapContent)}
          {work.workType === 'translate' && renderTranslate(work.content as TranslateContent)}
          {work.workType === 'pyramid' && renderPyramid(work.content as PyramidContent)}
          {work.workType === 'opq' && renderOPQ(work.content as OPQContent)}
          {work.workType === 'connector' && renderConnector(work.content as ConnectorContent)}
        </div>

        <div className="mt-8">
          <ShareButton
            title={`言語化トレーニング: ${work.title}`}
            text={buildShareText(work)}
          />
        </div>
      </div>
    </div>
  );
}
