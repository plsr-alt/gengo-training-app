import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-amber-50 text-slate-900">
      {/* Hero */}
      <section className="relative overflow-hidden px-4 pb-20 pt-16 sm:px-6 lg:px-8">
        {/* Accent shapes */}
        <div className="pointer-events-none absolute -left-20 -top-20 h-72 w-72 rounded-full bg-rose-200/40" />
        <div className="pointer-events-none absolute -right-10 top-40 h-48 w-48 rotate-12 rounded-3xl bg-indigo-200/30" />
        <div className="pointer-events-none absolute bottom-10 left-1/3 h-32 w-32 -rotate-6 rounded-2xl bg-amber-300/20" />

        <div className="relative mx-auto max-w-5xl">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            {/* Left: Copy */}
            <div>
              <p className="inline-block rounded-full border border-rose-300 bg-rose-50 px-4 py-1 text-sm font-medium text-rose-700">
                頭の中、ぐちゃぐちゃ問題に終止符を
              </p>
              <h1 className="mt-6 text-4xl font-black leading-tight tracking-tight sm:text-5xl">
                言語化
                <span className="relative inline-block text-indigo-600">
                  トレーニング
                  <span className="absolute -bottom-1 left-0 h-2 w-full rounded bg-indigo-200/60" />
                </span>
              </h1>
              <p className="mt-6 text-lg leading-relaxed text-slate-600">
                「言いたいことはあるのに、うまく言葉にできない」
                <br />
                「モヤモヤするけど、何にモヤモヤしてるか分からない」
                <br />
                <span className="mt-2 inline-block font-semibold text-slate-800">
                  ――それ、言語化の筋トレで変わります。
                </span>
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-8 py-4 text-lg font-bold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700 hover:shadow-xl"
                >
                  無料で始める
                </Link>
                <span className="text-sm text-slate-400">アカウント不要・60秒で開始</span>
              </div>
            </div>

            {/* Right: Before/After card */}
            <div className="relative">
              <div className="absolute -left-4 -top-4 h-full w-full rotate-2 rounded-3xl bg-indigo-100/50" />
              <div className="relative space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-xl">
                <p className="text-center text-xs font-bold uppercase tracking-widest text-slate-400">Before / After</p>

                {/* Before */}
                <div className="rounded-2xl border-2 border-dashed border-rose-200 bg-rose-50/50 p-4">
                  <p className="text-xs font-bold text-rose-500">BEFORE</p>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">
                    「会議で上司に否定されてムカついた。もう提案なんかしない」
                  </p>
                </div>

                <div className="flex justify-center">
                  <span className="text-2xl">↓</span>
                </div>

                {/* After */}
                <div className="rounded-2xl border-2 border-indigo-200 bg-indigo-50/50 p-4">
                  <p className="text-xs font-bold text-indigo-600">AFTER</p>
                  <div className="mt-2 space-y-2">
                    <div className="rounded-xl bg-white p-2 text-sm">
                      <span className="font-semibold text-emerald-600">事実:</span>{' '}
                      上司が「再検討してほしい」と言った。他の3人は発言しなかった。
                    </div>
                    <div className="rounded-xl bg-white p-2 text-sm">
                      <span className="font-semibold text-amber-600">感情:</span>{' '}
                      自分の意見は価値がないと感じた。
                    </div>
                    <div className="rounded-xl bg-white p-2 text-sm">
                      <span className="font-semibold text-rose-500">思い込み:</span>{' '}
                      「嫌われた」は解釈。事実は「再検討」の一言だけ。
                    </div>
                  </div>
                </div>

                <p className="text-center text-xs text-slate-400">
                  事実と感情を分けるだけで、見え方が変わる
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3 Works */}
      <section className="bg-white px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center text-sm font-bold uppercase tracking-widest text-indigo-600">
            3つのワーク
          </h2>
          <p className="mt-2 text-center text-2xl font-black sm:text-3xl">
            思考の解像度を上げる、3つの切り口
          </p>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {/* Work 1 */}
            <div className="group relative rounded-3xl border border-slate-200 bg-amber-50 p-6 transition hover:shadow-lg">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600 text-2xl font-black text-white">
                1
              </div>
              <h3 className="mt-4 text-xl font-bold">事実/感情仕分け</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                起きた出来事を「事実」と「感情」に分けるだけ。それだけで、思い込みに気づける。
              </p>
              <p className="mt-3 text-xs text-slate-400">
                所要時間: 5分 / 初心者向け
              </p>
            </div>

            {/* Work 2 */}
            <div className="group relative rounded-3xl border border-slate-200 bg-amber-50 p-6 transition hover:shadow-lg md:-translate-y-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600 text-2xl font-black text-white">
                2
              </div>
              <h3 className="mt-4 text-xl font-bold">因果関係マッピング</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                出来事のつながりを矢印で整理。「なぜそう思ったか」を可視化する。
              </p>
              <p className="mt-3 text-xs text-slate-400">
                所要時間: 10分 / 中級者向け
              </p>
            </div>

            {/* Work 3 */}
            <div className="group relative rounded-3xl border border-slate-200 bg-amber-50 p-6 transition hover:shadow-lg">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600 text-2xl font-black text-white">
                3
              </div>
              <h3 className="mt-4 text-xl font-bold">小5翻訳チャレンジ</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                むずかしい言葉を、小学5年生にも伝わるように言い換える。伝わる力が鍛えられる。
              </p>
              <p className="mt-3 text-xs text-slate-400">
                所要時間: 5分 / 全レベル対応
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Use case scenarios */}
      <section className="bg-slate-50 px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center text-sm font-bold uppercase tracking-widest text-indigo-600">
            こんな人に使われています
          </h2>
          <p className="mt-2 text-center text-2xl font-black sm:text-3xl">
            言語化の筋トレは、日常のあらゆる場面で効く
          </p>

          <div className="mt-12 grid gap-6 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <p className="text-3xl">🗣</p>
              <h3 className="mt-3 font-bold text-slate-900">会議で発言できない人</h3>
              <p className="mt-2 text-sm text-slate-600">
                「意見はあるけど、まとまらなくて黙ってしまう」を解消。事実/感情の仕分けで、伝えるべきことが明確になる。
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <p className="text-3xl">😤</p>
              <h3 className="mt-3 font-bold text-slate-900">感情的になりやすい人</h3>
              <p className="mt-2 text-sm text-slate-600">
                イラッとしたとき、その場で反応する前に一度整理するクセがつく。冷静に対応できる自分に変わる。
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <p className="text-3xl">📝</p>
              <h3 className="mt-3 font-bold text-slate-900">日報・報告が苦手な人</h3>
              <p className="mt-2 text-sm text-slate-600">
                何を書いていいか分からない悩みが減る。因果関係マッピングで「何が起きて、何が変わったか」が整理できる。
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <p className="text-3xl">💭</p>
              <h3 className="mt-3 font-bold text-slate-900">自分の気持ちが分からない人</h3>
              <p className="mt-2 text-sm text-slate-600">
                「なんとなくモヤモヤする」を放置しない。書き出すことで、自分が何に反応しているのか見えてくる。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-white px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-center text-sm font-bold uppercase tracking-widest text-indigo-600">
            FAQ
          </h2>
          <p className="mt-2 text-center text-2xl font-black sm:text-3xl">
            よくある質問
          </p>

          <div className="mt-12 space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
              <h3 className="font-bold text-slate-900">Q. 本当に無料ですか?</h3>
              <p className="mt-2 text-sm text-slate-600">
                はい、すべてのワークが無料で使えます。アカウント登録も不要です。データはお使いのブラウザに保存されるため、外部に送信されることはありません。
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
              <h3 className="font-bold text-slate-900">Q. 1回どのくらい時間がかかりますか?</h3>
              <p className="mt-2 text-sm text-slate-600">
                1ワーク5〜10分が目安です。通勤中や寝る前のスキマ時間に取り組めます。短くても、続けることで確実に言語化力が上がっていきます。
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
              <h3 className="font-bold text-slate-900">Q. どんな効果がありますか?</h3>
              <p className="mt-2 text-sm text-slate-600">
                自分の思考を客観視できるようになります。会議での発言、上司への報告、パートナーとの会話など、「伝わる」場面が増えたという声を多くいただいています。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA footer */}
      <section className="relative overflow-hidden bg-indigo-600 px-4 py-20 sm:px-6 lg:px-8">
        <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-indigo-500/50" />
        <div className="pointer-events-none absolute -bottom-12 left-10 h-40 w-40 rotate-12 rounded-3xl bg-indigo-400/30" />

        <div className="relative mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-black text-white sm:text-4xl">
            モヤモヤを言葉にする力、<br />今日から鍛えよう
          </h2>
          <p className="mt-4 text-indigo-100">
            1日5分、自分の思考と向き合う時間が未来を変える。
          </p>
          <div className="mt-8">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-2xl bg-white px-8 py-4 text-lg font-bold text-indigo-600 shadow-lg transition hover:bg-indigo-50 hover:shadow-xl"
            >
              無料で始める
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
