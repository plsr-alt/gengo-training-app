import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-indigo-50 to-white px-4">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
          言語化<span className="text-indigo-600">トレーニング</span>
        </h1>
        <p className="mt-4 text-lg leading-8 text-slate-600">
          頭の中のモヤモヤを、誰でも触れる言葉に変える。
          <br />
          3つのワークで思考の解像度を劇的に上げよう。
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
            <div className="text-2xl font-bold text-indigo-600">1</div>
            <h3 className="mt-2 font-semibold text-slate-900">事実/感情仕分け</h3>
            <p className="mt-1 text-sm text-slate-500">起きたことと感じたことを切り分ける</p>
          </div>
          <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
            <div className="text-2xl font-bold text-indigo-600">2</div>
            <h3 className="mt-2 font-semibold text-slate-900">因果関係マッピング</h3>
            <p className="mt-1 text-sm text-slate-500">出来事のつながりを矢印で整理する</p>
          </div>
          <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
            <div className="text-2xl font-bold text-indigo-600">3</div>
            <h3 className="mt-2 font-semibold text-slate-900">小5翻訳チャレンジ</h3>
            <p className="mt-1 text-sm text-slate-500">難しい言葉をやさしく言い換える</p>
          </div>
        </div>

        <div className="mt-10">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-8 py-4 text-lg font-semibold text-white shadow-lg transition hover:bg-indigo-700 hover:shadow-xl"
          >
            無料で始める
          </Link>
        </div>
        <p className="mt-4 text-sm text-slate-400">アカウント不要ですぐに使えます</p>
      </div>
    </div>
  );
}
