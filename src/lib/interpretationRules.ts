export type ReviewReasonValue =
  | 'intent'
  | 'evaluation'
  | 'generalization'
  | 'certainty'
  | 'meaning';

export interface DetectionResult {
  index: number;
  reasons: ReviewReasonValue[];
}

export const REVIEW_REASON_LABELS: Record<ReviewReasonValue, string> = {
  intent: '他人の意図を推定している',
  evaluation: '強い評価語が入っている',
  generalization: '一般化している',
  certainty: '確信しすぎた推定が入っている',
  meaning: '出来事に意味づけを足している',
};

export const REVIEW_REASON_DESCRIPTIONS: Record<ReviewReasonValue, string> = {
  intent: '相手の考えや狙いを、自分の推測で補っている状態です。',
  evaluation: '最悪・ダメ・完璧のような強い評価が入っています。',
  generalization: 'いつも・絶対・みんな など、広げすぎた表現です。',
  certainty: 'はず・に違いない・だろう など、確証なしの断定です。',
  meaning: '事実ではなく、自分の意味づけ・推測が入っています。',
};

const INTENT_PATTERNS = [
  /と思って(?:いる|る)/,
  /つもり(?:だ|でいる)/,
  /わざと/,
  /見下して/,
  /無視して/,
  /期待して(?:いない|ない)/,
  /と思われた/,
  /のせいだ/,
];

const EVALUATION_PATTERNS = [
  /最悪/,
  /完璧/,
  /ダメ(?:だ)?/,
  /ひどい/,
  /失敗(?:だ)?/,
  /価値がない/,
  /終わった/,
  /すごい/,
];

const GENERALIZATION_PATTERNS = [/いつも/, /絶対/, /みんな/, /毎回/, /誰も/, /全部/, /何も/];

const CERTAINTY_PATTERNS = [/に違いない/, /はず(?:だ)?/, /だろう/, /きっと/, /かもしれない/];

const MEANING_PATTERNS = [
  /気がする/,
  /ような気/,
  /軽く見られ/,
  /嫌われ/,
  /反対(?:された|だ)/,
  /評価が(?:下がった|上がった)/,
  /思われた/,
];

function normalizeText(value: string) {
  return value.trim().replace(/[。．.!！?？]+$/g, '');
}

export function detectInterpretationFlags(items: string[]): DetectionResult[] {
  return items.reduce<DetectionResult[]>((results, item, index) => {
    const text = normalizeText(item);
    const reasons: ReviewReasonValue[] = [];

    if (INTENT_PATTERNS.some((pattern) => pattern.test(text))) {
      reasons.push('intent');
    }

    if (EVALUATION_PATTERNS.some((pattern) => pattern.test(text))) {
      reasons.push('evaluation');
    }

    if (GENERALIZATION_PATTERNS.some((pattern) => pattern.test(text))) {
      reasons.push('generalization');
    }

    if (CERTAINTY_PATTERNS.some((pattern) => pattern.test(text))) {
      reasons.push('certainty');
    }

    if (MEANING_PATTERNS.some((pattern) => pattern.test(text))) {
      reasons.push('meaning');
    }

    if (reasons.length > 0) {
      results.push({ index, reasons });
    }

    return results;
  }, []);
}
