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
    <div className="min-h-screen quiet-app-shell">
      <main className="mx-auto max-w-5xl px-6 py-10 sm:px-10">
        <header className="flex flex-col gap-6 rounded-[32px] quiet-panel p-6 shadow-[0_32px_120px_-80px_rgba(15,23,42,0.8)] backdrop-blur sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] quiet-text-secondary">Quiet Mode</p>
            <h1 className="mt-3 text-3xl font-semibold quiet-text-primary">Welcome back.</h1>
            <p className="mt-2 text-sm leading-6 quiet-text-secondary">
              Your calm dashboard is ready. Keep your routine simple and consistent.
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="inline-flex items-center justify-center rounded-full quiet-secondary-btn px-5 py-3 text-sm font-semibold transition"
          >
            Log out
          </button>
        </header>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <section className="rounded-[32px] quiet-panel p-6 backdrop-blur">
            <p className="text-sm uppercase tracking-[0.3em] quiet-text-secondary">Today</p>
            <h2 className="mt-4 text-2xl font-semibold quiet-text-primary">Focus & recovery</h2>
            <p className="mt-3 text-sm leading-6 quiet-text-secondary">
              Quiet Mode helps you stay grounded with fewer distractions and softer transitions from day to night.
            </p>
          </section>

          <section className="rounded-[32px] quiet-panel p-6 backdrop-blur">
            <p className="text-sm uppercase tracking-[0.3em] quiet-text-secondary">Your space</p>
            <div className="mt-6 space-y-4 text-sm quiet-text-secondary">
              <div className="rounded-3xl quiet-inner-card p-4">
                <p className="font-medium quiet-text-primary">Evening reset</p>
                <p className="mt-2 quiet-text-secondary">A quiet routine that helps your mind settle before sleep.</p>
                <button
                  onClick={() => router.push('/reset/night')}
                  className="mt-4 inline-flex items-center justify-center rounded-full quiet-secondary-btn px-4 py-2 text-sm font-semibold transition"
                >
                  Start Night Reset
                </button>
              </div>
              <div className="rounded-3xl quiet-inner-card p-4">
                <p className="font-medium quiet-text-primary">Morning calm</p>
                <p className="mt-2 quiet-text-secondary">A gentle way to begin the day without rush or overwhelm.</p>
                <button
                  onClick={() => router.push('/reset/morning')}
                  className="mt-4 inline-flex items-center justify-center rounded-full quiet-secondary-btn px-4 py-2 text-sm font-semibold transition"
                >
                  Start Morning Reset
                </button>
              </div>
              <div className="rounded-3xl quiet-inner-card p-4">
                <p className="font-medium quiet-text-primary">Review & reflect</p>
                <p className="mt-2 quiet-text-secondary">Look back at your reset history and track your progress.</p>
                <button
                  onClick={() => router.push('/history')}
                  className="mt-4 inline-flex items-center justify-center rounded-full quiet-secondary-btn px-4 py-2 text-sm font-semibold transition"
                >
                  View History
                </button>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}
