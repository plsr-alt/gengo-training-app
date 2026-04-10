'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';

const ONBOARDED_KEY = 'gengo_onboarded';

interface OnboardingProps {
  onComplete: () => void;
}

const steps = [
  {
    emoji: '🧠',
    title: '言語化トレーニングへようこそ',
    body: (
      <div className="space-y-4 text-sm leading-relaxed text-slate-600">
        <p>
          このアプリは、頭の中のモヤモヤを「言葉」に変えるトレーニングツールです。
        </p>
        <p>
          日々の出来事を題材に、事実と感情を切り分けたり、因果関係を整理したり、むずかしい言葉をやさしく言い換えたり。
        </p>
        <p className="font-semibold text-slate-800">
          1回5分。続けるほど、思考の解像度が上がっていきます。
        </p>
      </div>
    ),
  },
  {
    emoji: '✂️',
    title: '最初のワーク: 事実と感情を分ける',
    body: (
      <div className="space-y-4 text-sm leading-relaxed text-slate-600">
        <p>たとえば、こんな出来事があったとします:</p>
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="font-semibold text-slate-800">
            「会議で自分の提案を上司に否定された」
          </p>
        </div>
        <p>これを「事実」と「感情」に分けてみると...</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3">
            <p className="text-xs font-bold text-emerald-700">事実</p>
            <ul className="mt-2 space-y-1 text-slate-700">
              <li>・上司が「再検討して」と言った</li>
              <li>・他の3人は発言しなかった</li>
              <li>・会議は30分で終了した</li>
            </ul>
          </div>
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
            <p className="text-xs font-bold text-amber-700">感情</p>
            <ul className="mt-2 space-y-1 text-slate-700">
              <li>・自分はダメだと思った</li>
              <li>・嫌われたかもしれない</li>
              <li>・もう提案はやめよう</li>
            </ul>
          </div>
        </div>
        <p className="text-xs text-slate-400">
          分けるだけで「否定された」が思い込みだったと気づけることがあります。
        </p>
      </div>
    ),
  },
  {
    emoji: '🚀',
    title: '最初のワークを体験しよう',
    body: (
      <div className="space-y-4 text-sm leading-relaxed text-slate-600">
        <div className="rounded-2xl border-2 border-indigo-200 bg-indigo-50 p-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🧩</span>
            <div>
              <p className="font-bold text-indigo-900">思考の仕分けボックス</p>
              <p className="text-xs text-indigo-600">事実/感情仕分けワーク</p>
            </div>
          </div>
          <p className="mt-3 text-slate-700">
            日常の出来事を「事実」と「感情」に分けるだけ。頭の中がスッキリ整理されます。
          </p>
        </div>
        <p className="font-semibold text-slate-800">
          最初のワークは「思考の仕分けボックス」。3分で終わります。
        </p>
      </div>
    ),
    cta: '/work/fact-emotion',
  },
];

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const router = useRouter();

  const finish = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(ONBOARDED_KEY, 'true');
    }
    onComplete();
  }, [onComplete]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      const currentStepData = steps[currentStep];
      finish();
      if ('cta' in currentStepData && currentStepData.cta) {
        router.push(currentStepData.cta as string);
      }
    }
  };

  const step = steps[currentStep];
  const isLast = currentStep === steps.length - 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
      <div className="w-full max-w-lg rounded-3xl bg-white shadow-2xl">
        <div className="p-6 sm:p-8">
          {/* Header */}
          <div className="text-center">
            <span className="text-5xl">{step.emoji}</span>
            <h2 className="mt-4 text-xl font-black text-slate-900 sm:text-2xl">
              {step.title}
            </h2>
          </div>

          {/* Body */}
          <div className="mt-6">{step.body}</div>

          {/* Progress dots */}
          <div className="mt-8 flex items-center justify-center gap-2">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`h-2 rounded-full transition-all ${
                  i === currentStep
                    ? 'w-6 bg-indigo-600'
                    : 'w-2 bg-slate-200'
                }`}
              />
            ))}
          </div>

          {/* Actions */}
          <div className="mt-6 flex items-center justify-between">
            <button
              type="button"
              onClick={finish}
              className="text-sm text-slate-400 transition hover:text-slate-600"
            >
              スキップ
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="rounded-xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-indigo-700"
            >
              {isLast ? 'ワークを始める' : '次へ'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
