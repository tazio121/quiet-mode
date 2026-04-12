import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Logo } from '@/components/Logo'
import { LogoutButton } from '@/components/LogoutButton'

// ─── Types ────────────────────────────────────────────────────────────────────

type LatestReset = {
  id: string
  type: 'morning' | 'night'
  mood: string
  created_at: string
  summary: string | null
  main_focus: string | null
  let_go_tonight: string | null
  closure_suggestion: string | null
}

type DashboardData = {
  latestMorning: LatestReset | null
  latestNight: LatestReset | null
  totalResets: number
}

// ─── Data fetching ────────────────────────────────────────────────────────────

async function getDashboardData(userId: string): Promise<DashboardData> {
  const supabase = await createClient()

  const selectFields = `
    id,
    type,
    mood,
    created_at,
    ai_resets (
      summary,
      main_focus,
      let_go_tonight,
      closure_suggestion
    )
  `

  const [morningResult, nightResult, countResult] = await Promise.all([
    supabase
      .from('check_ins')
      .select(selectFields)
      .eq('user_id', userId)
      .eq('type', 'morning')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),

    supabase
      .from('check_ins')
      .select(selectFields)
      .eq('user_id', userId)
      .eq('type', 'night')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),

    supabase
      .from('check_ins')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId),
  ])

  function toReset(data: {
    id: string
    type: string
    mood: string
    created_at: string
    ai_resets: Array<{
      summary: string | null
      main_focus: string | null
      let_go_tonight: string | null
      closure_suggestion: string | null
    }>
  } | null): LatestReset | null {
    if (!data) return null
    return {
      id: data.id,
      type: data.type as 'morning' | 'night',
      mood: data.mood,
      created_at: data.created_at,
      summary: data.ai_resets?.[0]?.summary ?? null,
      main_focus: data.ai_resets?.[0]?.main_focus ?? null,
      let_go_tonight: data.ai_resets?.[0]?.let_go_tonight ?? null,
      closure_suggestion: data.ai_resets?.[0]?.closure_suggestion ?? null,
    }
  }

  return {
    latestMorning: toReset(morningResult.data),
    latestNight: toReset(nightResult.data),
    totalResets: countResult.count ?? 0,
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function relativeTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function welcomeSubtext(totalResets: number): string {
  if (totalResets === 0) return 'Your calm space is ready. Start your first reset whenever you feel like it.'
  if (totalResets === 1) return `1 reset completed. Keep the routine going.`
  return `${totalResets} resets completed. Keep your routine simple and consistent.`
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function Dashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { latestMorning, latestNight, totalResets } = await getDashboardData(user.id)

  return (
    <div className="min-h-screen quiet-app-shell">
      <main className="mx-auto max-w-5xl px-6 py-10 sm:px-10">

        {/* ── Header ── */}
        <header className="flex flex-col gap-6 rounded-[32px] quiet-panel p-6 shadow-[0_32px_120px_-80px_rgba(15,23,42,0.8)] backdrop-blur sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Logo size="sm" className="mb-4" />
            <h1 className="text-3xl font-semibold quiet-text-primary">Welcome back.</h1>
            <p className="mt-2 text-sm leading-6 quiet-text-secondary">
              {welcomeSubtext(totalResets)}
            </p>
          </div>
          <LogoutButton />
        </header>

        {/* ── Latest Resets ── */}
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <ResetCard type="morning" reset={latestMorning} />
          <ResetCard type="night" reset={latestNight} />
        </div>

        {/* ── Quick Actions ── */}
        <section className="mt-6 rounded-[32px] quiet-panel p-6 backdrop-blur">
          <p className="mb-4 text-[10px] font-medium uppercase tracking-[0.18em] quiet-text-secondary">
            Quick actions
          </p>
          <div className="grid gap-3 sm:grid-cols-3">
            <ActionCard
              href="/reset/morning"
              label="Morning Reset"
              description="Clear your head before the day begins."
            />
            <ActionCard
              href="/reset/night"
              label="Night Reset"
              description="Quiet your mind before sleep."
            />
            <ActionCard
              href="/history"
              label="View History"
              description="Review all your past resets."
            />
          </div>
        </section>

      </main>
    </div>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ResetCard({ type, reset }: { type: 'morning' | 'night'; reset: LatestReset | null }) {
  const isMorning = type === 'morning'
  const label = isMorning ? 'Morning Reset' : 'Night Reset'
  const href = isMorning ? '/reset/morning' : '/reset/night'
  const badgeClass = isMorning ? 'quiet-badge-morning' : 'quiet-badge-night'

  // Empty state
  if (!reset) {
    return (
      <section className="rounded-[32px] quiet-panel p-6 backdrop-blur">
        <div className="mb-4 flex items-center gap-3">
          <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${badgeClass}`}>
            {label}
          </span>
        </div>
        <p className="text-base font-semibold quiet-text-primary">
          No {type} reset yet
        </p>
        <p className="mt-2 text-sm leading-6 quiet-text-secondary">
          {isMorning
            ? 'Start your day with a moment of clarity.'
            : 'Wind down with a calm reset before sleep.'}
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

  // Which secondary field to surface
  const highlight = isMorning
    ? reset.main_focus
    : (reset.let_go_tonight ?? reset.closure_suggestion)
  const highlightLabel = isMorning
    ? 'Main Focus'
    : reset.let_go_tonight ? 'Let Go Tonight' : 'Closure'

  return (
    <section className="rounded-[32px] quiet-panel p-6 backdrop-blur">
      {/* Badge + timestamp */}
      <div className="mb-4 flex items-center justify-between">
        <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${badgeClass}`}>
          {label}
        </span>
        <span className="text-xs quiet-text-secondary">
          {relativeTime(reset.created_at)}
        </span>
      </div>

      {/* Mood */}
      <p className="mb-1 text-[10px] font-medium uppercase tracking-[0.18em] quiet-text-secondary">
        Mood
      </p>
      <p className="mb-4 text-sm font-medium capitalize quiet-text-primary">
        {reset.mood}
      </p>

      {/* Summary */}
      {reset.summary && (
        <div className="quiet-inner-card mb-3 p-4">
          <p className="mb-2 text-[10px] font-medium uppercase tracking-[0.18em] quiet-text-secondary">
            Summary
          </p>
          <p className="text-sm leading-6 quiet-text-secondary line-clamp-3">
            {reset.summary}
          </p>
        </div>
      )}

      {/* Main focus / Let go */}
      {highlight && (
        <div className="quiet-inner-card p-4">
          <p className="mb-2 text-[10px] font-medium uppercase tracking-[0.18em] quiet-text-secondary">
            {highlightLabel}
          </p>
          <p className="text-sm leading-6 quiet-text-secondary line-clamp-2">
            {highlight}
          </p>
        </div>
      )}
    </section>
  )
}

function ActionCard({
  href,
  label,
  description,
}: {
  href: string
  label: string
  description: string
}) {
  return (
    <Link href={href} className="quiet-inner-card-link block p-4">
      <p className="text-sm font-semibold quiet-text-primary">{label}</p>
      <p className="mt-1 text-xs leading-5 quiet-text-secondary">{description}</p>
    </Link>
  )
}
