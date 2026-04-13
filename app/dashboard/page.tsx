import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Logo } from '@/components/Logo'
import { LogoutButton } from '@/components/LogoutButton'

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
  weeklyCompletedDays: number
}

function getWeekStartUtc(date: Date) {
  const utc = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()))
  const dayOfWeek = utc.getUTCDay()
  utc.setUTCDate(utc.getUTCDate() - dayOfWeek)
  return utc
}

function countDistinctDays(items: Array<{ created_at?: string | null }>) {
  const uniqueDays = new Set<string>()

  for (const item of items ?? []) {
    if (!item?.created_at) continue

    const dayKey = new Date(item.created_at).toISOString().slice(0, 10)
    uniqueDays.add(dayKey)
  }

  return uniqueDays.size
}

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

  const now = new Date()
  const weekStart = getWeekStartUtc(now)
  const nowIso = now.toISOString()
  const weekStartIso = weekStart.toISOString()

  const [morningResult, nightResult, countResult, weeklyResult] = await Promise.all([
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

    supabase
      .from('check_ins')
      .select('created_at')
      .eq('user_id', userId)
      .gte('created_at', weekStartIso)
      .lte('created_at', nowIso),
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
    weeklyCompletedDays: countDistinctDays(weeklyResult.data ?? []),
  }
}

function getWeeklyProgressText(completedDays: number) {
  if (completedDays === 0) {
    return 'Start your streak today.'
  }

  if (completedDays <= 2) {
    return "You're building consistency."
  }

  if (completedDays <= 5) {
    return 'Strong rhythm this week.'
  }

  return "You're showing up for yourself."
}

export default async function Dashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const dashboardData = await getDashboardData(user.id)

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
          <ResetCard type="morning" reset={dashboardData.latestMorning} />
          <ResetCard type="night" reset={dashboardData.latestNight} />
        </div>

        <section className="mt-6 rounded-[32px] quiet-panel p-5 backdrop-blur sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-end gap-3">
              <span className="text-5xl font-semibold quiet-text-primary">{dashboardData.totalResets}</span>
              <span className="text-sm uppercase tracking-[0.3em] quiet-text-secondary">total resets</span>
            </div>
            <div className="text-right">
              <p className="text-xs uppercase tracking-[0.22em] quiet-text-secondary">Keep going</p>
            </div>
          </div>

          <div className="mt-4 rounded-[24px] border border-white/10 bg-white/5 p-4">
            <p className="text-[10px] uppercase tracking-[0.18em] quiet-text-secondary">this week</p>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-[var(--quiet-primary)]"
                style={{ width: `${Math.min(Math.max(dashboardData.weeklyCompletedDays / 7, 0), 1) * 100}%` }}
              />
            </div>
            <p className="mt-3 text-sm font-semibold quiet-text-primary">
              {dashboardData.weeklyCompletedDays} of 7 days
            </p>
            <p className="mt-2 text-sm leading-6 quiet-text-secondary">
              {getWeeklyProgressText(dashboardData.weeklyCompletedDays)}
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

function ResetCard({ type, reset }: { type: 'morning' | 'night'; reset: LatestReset | null }) {
  const isMorning = type === 'morning'
  const label = isMorning ? 'Morning Reset' : 'Night Reset'
  const href = isMorning ? '/reset/morning' : '/reset/night'

  if (reset) {
    const date = new Date(reset.created_at).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    })

    return (
      <section className="rounded-[32px] quiet-panel p-6 backdrop-blur">
        <div className="mb-4 flex items-center gap-3">
          <span className={`inline-flex items-center rounded-full bg-white/5 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] ${
            isMorning ? 'text-green-400' : 'text-blue-400'
          }`}>
            {label}
          </span>
          <span className="text-xs quiet-text-secondary">{date}</span>
        </div>
        <p className="text-base font-semibold quiet-text-primary mb-2">
          Latest {isMorning ? 'Morning' : 'Night'} Reset
        </p>
        <p className="text-sm quiet-text-secondary mb-4">
          Mood: {reset.mood}
        </p>
        {reset.summary && (
          <p className="text-sm quiet-text-secondary line-clamp-2">
            {reset.summary}
          </p>
        )}
        <Link
          href={href}
          className="mt-5 inline-flex items-center justify-center rounded-full quiet-primary-cta px-4 py-2 text-sm font-semibold transition"
        >
          Start New {isMorning ? 'Morning' : 'Night'} Reset
        </Link>
      </section>
    )
  }

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
