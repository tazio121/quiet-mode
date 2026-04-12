'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function Dashboard() {
  const router = useRouter()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div className="min-h-screen bg-[#050508] text-white">
      <main className="mx-auto max-w-5xl px-6 py-10 sm:px-10">
        <header className="flex flex-col gap-6 rounded-[32px] border border-white/10 bg-white/5 p-6 shadow-[0_32px_120px_-80px_rgba(15,23,42,0.8)] backdrop-blur sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Quiet Mode</p>
            <h1 className="mt-3 text-3xl font-semibold text-white">Welcome back.</h1>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              Your calm dashboard is ready. Keep your routine simple and consistent.
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="inline-flex items-center justify-center rounded-full bg-slate-100 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-200"
          >
            Log out
          </button>
        </header>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <section className="rounded-[32px] border border-white/10 bg-white/5 p-6 backdrop-blur">
            <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Today</p>
            <h2 className="mt-4 text-2xl font-semibold text-white">Focus & recovery</h2>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              Quiet Mode helps you stay grounded with fewer distractions and softer transitions from day to night.
            </p>
          </section>

          <section className="rounded-[32px] border border-white/10 bg-white/5 p-6 backdrop-blur">
            <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Your space</p>
            <div className="mt-6 space-y-4 text-sm text-slate-300">
              <div className="rounded-3xl border border-slate-800/80 bg-slate-950/70 p-4">
                <p className="font-medium text-white">Evening reset</p>
                <p className="mt-2 text-slate-400">A quiet routine that helps your mind settle before sleep.</p>
              </div>
              <div className="rounded-3xl border border-slate-800/80 bg-slate-950/70 p-4">
                <p className="font-medium text-white">Morning calm</p>
                <p className="mt-2 text-slate-400">A gentle way to begin the day without rush or overwhelm.</p>
                <button
                  onClick={() => router.push('/reset/morning')}
                  className="mt-4 inline-flex items-center justify-center rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-slate-200"
                >
                  Start Morning Reset
                </button>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}
