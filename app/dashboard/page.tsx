import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Logo } from '@/components/Logo'
import { LogoutButton } from '@/components/LogoutButton'

export default async function Dashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  return (
    <div className="min-h-screen quiet-app-shell">
      <main className="mx-auto max-w-5xl px-6 py-10 sm:px-10">

        <header className="flex flex-col gap-6 rounded-[32px] quiet-panel p-6 shadow-[0_32px_120px_-80px_rgba(15,23,42,0.8)] backdrop-blur sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Logo size="sm" className="mb-4" />
            <h1 className="text-3xl font-semibold quiet-text-primary">Welcome back.</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 quiet-text-secondary">
              Your calm space is ready. Start your morning and night resets when you are.
            </p>
          </div>
          <LogoutButton />
        </header>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <ResetCard type="morning" />
          <ResetCard type="night" />
        </div>

        <section className="mt-6 rounded-[32px] quiet-panel p-5 backdrop-blur sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-end gap-3">
              <span className="text-5xl font-semibold quiet-text-primary">0</span>
              <span className="text-sm uppercase tracking-[0.3em] quiet-text-secondary">day streak</span>
            </div>
            <div className="text-right">
              <p className="text-xs uppercase tracking-[0.22em] quiet-text-secondary">0 of 7 days</p>
            </div>
          </div>

          <div className="mt-4 rounded-[24px] border border-white/10 bg-white/5 p-4">
            <p className="text-[10px] uppercase tracking-[0.18em] quiet-text-secondary">this week</p>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
              <div className="h-full w-0 rounded-full bg-[var(--quiet-primary)]" />
            </div>
            <p className="mt-3 text-sm leading-6 quiet-text-secondary">
              Keep the weekly streak visible with a subtle, calm progress indicator.
            </p>
          </div>
        </section>

        <section className="mt-6 rounded-[32px] quiet-panel p-6 backdrop-blur">
          <p className="mb-4 text-[10px] font-medium uppercase tracking-[0.18em] quiet-text-secondary">
            Quick actions
          </p>
          <div className="grid gap-3 sm:grid-cols-3">
            <ActionCard
              href="/reset/morning"
              label="Morning Reset"
              description="Start your day with a calm reset."
            />
            <ActionCard
              href="/reset/night"
              label="Night Reset"
              description="Wind down with a gentle night reset."
            />
            <ActionCard
              href="/history"
              label="View History"
              description="Review your recent reset activity."
            />
          </div>
        </section>
      </main>
    </div>
  )
}

function ResetCard({ type }: { type: 'morning' | 'night' }) {
  const isMorning = type === 'morning'
  const label = isMorning ? 'Morning Reset' : 'Night Reset'
  const href = isMorning ? '/reset/morning' : '/reset/night'

  return (
    <section className="rounded-[32px] quiet-panel p-6 backdrop-blur">
      <div className="mb-4 flex items-center gap-3">
        <span className="inline-flex items-center rounded-full bg-white/5 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-[var(--quiet-primary)]">
          {label}
        </span>
      </div>
      <p className="text-base font-semibold quiet-text-primary">No {type} reset yet</p>
      <p className="mt-2 text-sm leading-6 quiet-text-secondary">
        {isMorning
          ? 'Start your day with a quiet reset.'
          : 'Wind down gently before sleep.'}
      </p>
      <Link
        href={href}
        className="mt-5 inline-flex items-center justify-center rounded-full quiet-primary-cta px-4 py-2 text-sm font-semibold transition"
      >
        Start {isMorning ? 'Morning' : 'Night'} Reset
      </Link>
    </section>
  )
}

function ActionCard({ href, label, description }: { href: string; label: string; description: string }) {
  return (
    <Link href={href} className="quiet-inner-card-link block h-full p-4">
      <p className="text-sm font-semibold quiet-text-primary">{label}</p>
      <p className="mt-2 text-xs leading-5 quiet-text-secondary">{description}</p>
    </Link>
  )
}
