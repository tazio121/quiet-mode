import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

type HistoryItem = {
  check_in_id: string
  type: 'morning' | 'night'
  mood: string
  raw_input: string
  created_at: string
  summary: string | null
  main_focus: string | null
  avoid_text: string | null
  calming_message: string | null
  next_action: string | null
  tomorrow_list: string | null
  let_go_tonight: string | null
  closure_suggestion: string | null
}

async function getHistory(userId: string, filter?: 'all' | 'morning' | 'night'): Promise<HistoryItem[]> {
  const supabase = await createClient()

  let query = supabase
    .from('check_ins')
    .select(`
      id,
      type,
      mood,
      raw_input,
      created_at,
      ai_resets (
        summary,
        main_focus,
        avoid_text,
        calming_message,
        next_action,
        tomorrow_list,
        let_go_tonight,
        closure_suggestion
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (filter && filter !== 'all') {
    query = query.eq('type', filter)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching history:', error)
    return []
  }

  return data.map(item => ({
    check_in_id: item.id,
    type: item.type,
    mood: item.mood,
    raw_input: item.raw_input,
    created_at: item.created_at,
    summary: item.ai_resets?.[0]?.summary || null,
    main_focus: item.ai_resets?.[0]?.main_focus || null,
    avoid_text: item.ai_resets?.[0]?.avoid_text || null,
    calming_message: item.ai_resets?.[0]?.calming_message || null,
    next_action: item.ai_resets?.[0]?.next_action || null,
    tomorrow_list: item.ai_resets?.[0]?.tomorrow_list || null,
    let_go_tonight: item.ai_resets?.[0]?.let_go_tonight || null,
    closure_suggestion: item.ai_resets?.[0]?.closure_suggestion || null,
  }))
}

const VALID_FILTERS = ['all', 'morning', 'night'] as const

type FilterType = (typeof VALID_FILTERS)[number]

type HistorySearchParams = {
  filter?: string | string[]
}

function normalizeFilter(filter?: string | string[]): FilterType {
  if (!filter) {
    return 'all'
  }

  const value = Array.isArray(filter) ? filter[0] : filter
  const normalized = value?.trim().toLowerCase()

  return VALID_FILTERS.includes(normalized as FilterType)
    ? (normalized as FilterType)
    : 'all'
}

export default async function HistoryPage({
  searchParams,
}: {
  searchParams: Promise<HistorySearchParams>
}) {
  const resolvedSearchParams = await searchParams

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const filter = normalizeFilter(resolvedSearchParams?.filter)
  const history = await getHistory(user.id, filter)
  const filteredHistory =
    filter === 'all'
      ? history
      : history.filter((item) => item.type === filter)

  return (
    <div className="min-h-screen bg-[#050508] text-white">
      <main className="mx-auto max-w-5xl px-6 py-10 sm:px-10">
        <a
          href="/dashboard"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-300 transition hover:text-white"
        >
          ← Back to Dashboard
        </a>

        <header className="mb-8">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Quiet Mode</p>
          <h1 className="mt-3 text-3xl font-semibold text-white">Your Reset History</h1>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            Review your past morning and night resets to track your progress.
          </p>
        </header>

        <div className="mb-6 flex gap-2">
          <FilterButton href="/history?filter=all" active={filter === 'all'}>All</FilterButton>
          <FilterButton href="/history?filter=morning" active={filter === 'morning'}>Morning</FilterButton>
          <FilterButton href="/history?filter=night" active={filter === 'night'}>Night</FilterButton>
        </div>

        {filteredHistory.length === 0 ? (
          <div className="rounded-[32px] border border-white/10 bg-white/5 p-12 text-center backdrop-blur">
            <p className="text-lg font-medium text-white">
              {filter === 'all'
                ? 'No resets yet'
                : filter === 'morning'
                  ? 'No morning resets found'
                  : 'No night resets found'}
            </p>
            <p className="mt-2 text-sm text-slate-400">
              {filter === 'all'
                ? 'Start your first reset to see your history here.'
                : 'Try a different filter or add a new reset to see it here.'}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredHistory.map((item) => (
              <HistoryCard key={item.check_in_id} item={item} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

function FilterButton({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center rounded-full px-4 py-2 text-sm font-medium transition ${
        active
          ? 'bg-white/10 text-white'
          : 'text-slate-400 hover:bg-white/5 hover:text-white'
      }`}
    >
      {children}
    </Link>
  )
}

function HistoryCard({ item }: { item: HistoryItem }) {
  const date = new Date(item.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  const previewInput = item.raw_input.length > 100
    ? item.raw_input.substring(0, 100) + '...'
    : item.raw_input

  return (
    <div className="rounded-[32px] border border-white/10 bg-white/5 p-6 backdrop-blur">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
              item.type === 'morning'
                ? 'bg-amber-500/20 text-amber-300'
                : 'bg-indigo-500/20 text-indigo-300'
            }`}>
              {item.type === 'morning' ? 'Morning Reset' : 'Night Reset'}
            </span>
            <span className="text-sm text-slate-400">{date}</span>
          </div>
          <p className="mt-3 text-sm text-slate-300">
            <span className="font-medium text-white">Mood:</span> {item.mood}
          </p>
          <p className="mt-2 text-sm text-slate-300">
            <span className="font-medium text-white">Your input:</span> {previewInput}
          </p>
        </div>
      </div>

      {item.summary && (
        <div className="mt-6 space-y-4">
          <div>
            <h3 className="text-sm font-medium text-white">Summary</h3>
            <p className="mt-1 text-sm text-slate-300">{item.summary}</p>
          </div>

          {item.type === 'morning' ? (
            <>
              {item.main_focus && (
                <div>
                  <h3 className="text-sm font-medium text-white">Main Focus</h3>
                  <p className="mt-1 text-sm text-slate-300">{item.main_focus}</p>
                </div>
              )}
              {item.avoid_text && (
                <div>
                  <h3 className="text-sm font-medium text-white">What to Avoid</h3>
                  <p className="mt-1 text-sm text-slate-300">{item.avoid_text}</p>
                </div>
              )}
              {item.calming_message && (
                <div>
                  <h3 className="text-sm font-medium text-white">Calming Message</h3>
                  <p className="mt-1 text-sm text-slate-300">{item.calming_message}</p>
                </div>
              )}
              {item.next_action && (
                <div>
                  <h3 className="text-sm font-medium text-white">Next Action</h3>
                  <p className="mt-1 text-sm text-slate-300">{item.next_action}</p>
                </div>
              )}
            </>
          ) : (
            <>
              {item.tomorrow_list && (
                <div>
                  <h3 className="text-sm font-medium text-white">Tomorrow&apos;s Focus</h3>
                  <p className="mt-1 text-sm text-slate-300">{item.tomorrow_list}</p>
                </div>
              )}
              {item.let_go_tonight && (
                <div>
                  <h3 className="text-sm font-medium text-white">Let Go Tonight</h3>
                  <p className="mt-1 text-sm text-slate-300">{item.let_go_tonight}</p>
                </div>
              )}
              {item.calming_message && (
                <div>
                  <h3 className="text-sm font-medium text-white">Calming Message</h3>
                  <p className="mt-1 text-sm text-slate-300">{item.calming_message}</p>
                </div>
              )}
              {item.closure_suggestion && (
                <div>
                  <h3 className="text-sm font-medium text-white">Closure Suggestion</h3>
                  <p className="mt-1 text-sm text-slate-300">{item.closure_suggestion}</p>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}