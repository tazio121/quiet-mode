import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#050508] text-white">
      <main className="mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-6 py-16 sm:px-10">
        <div className="flex flex-col gap-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300 backdrop-blur">
            Quiet Mode
          </div>

          <div className="max-w-3xl space-y-6">
            <p className="text-sm uppercase tracking-[0.3em] text-slate-500">
              Calm, night and morning
            </p>
            <h1 className="text-5xl font-semibold tracking-tight text-white sm:text-6xl">
              Clear your head in the morning. Quiet it at night.
            </h1>
            <p className="max-w-2xl text-base leading-8 text-slate-400 sm:text-lg">
              Designed for young men with overactive minds and restless sleep, Quiet Mode gives you a calm space to build gentle routines and reclaim better rest.
            </p>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center rounded-full bg-slate-100 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-200"
            >
              Start free
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-full border border-slate-700 bg-white/5 px-6 py-3 text-sm font-semibold text-slate-100 transition hover:border-slate-500 hover:bg-white/10"
            >
              Log in
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
              <p className="text-sm uppercase tracking-[0.3em] text-slate-400">
                Quiet mornings
              </p>
              <p className="mt-3 text-lg font-medium text-white">
                Start your day without the rush and keep your mind centered before the world takes over.
              </p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
              <p className="text-sm uppercase tracking-[0.3em] text-slate-400">
                Nightly reset
              </p>
              <p className="mt-3 text-lg font-medium text-white">
                Wind down with a calm interface built to help your thoughts settle and your sleep deepen.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
