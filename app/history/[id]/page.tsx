import Link from 'next/link'
import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Logo } from '@/components/Logo'

type ResetDetail = {
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

async function getResetDetail(userId: string, resetId: string): Promise<ResetDetail | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
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
    .eq('id', resetId)
    .single()

  if (error || !data) {
    return null
  }

  return {
    check_in_id: data.id,
    type: data.type,
    mood: data.mood,
    raw_input: data.raw_input,
    created_at: data.created_at,
    summary: data.ai_resets?.[0]?.summary || null,
    main_focus: data.ai_resets?.[0]?.main_focus || null,
    avoid_text: data.ai_resets?.[0]?.avoid_text || null,
    calming_message: data.ai_resets?.[0]?.calming_message || null,
    next_action: data.ai_resets?.[0]?.next_action || null,
    tomorrow_list: data.ai_resets?.[0]?.tomorrow_list || null,
    let_go_tonight: data.ai_resets?.[0]?.let_go_tonight || null,
    closure_suggestion: data.ai_resets?.[0]?.closure_suggestion || null,
  }
}

export default async function ResetDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const resolvedParams = await params
  const resetId = resolvedParams.id

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const reset = await getResetDetail(user.id, resetId)

  if (!reset) {
    notFound()
  }

  const date = new Date(reset.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  const heading = reset.type === 'morning' ? 'Morning Reset' : 'Night Reset'

  return (
    <div className="min-h-screen quiet-app-shell">
      <main className="mx-auto max-w-4xl px-6 py-10 sm:px-10">
        <Link
          href="/history"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium quiet-text-secondary transition hover:text-white"
        >
          ← Back to History
        </Link>

        <header className="mb-8">
          <Logo size="sm" className="mb-4" />
          <h1 className="text-3xl font-semibold quiet-text-primary">{heading}</h1>
          <p className="mt-2 text-sm leading-6 quiet-text-secondary">
            {date}
          </p>
        </header>

        <div className="space-y-6">
          {/* Shared fields */}
          <div className="rounded-[32px] quiet-panel p-6 backdrop-blur">
            <h2 className="text-lg font-medium quiet-text-primary mb-4">Reset Details</h2>
            <div className="space-y-4">
              <div>
                <span className="text-sm font-medium quiet-text-primary">Type:</span>
                <span className={`ml-2 inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                  reset.type === 'morning' ? 'quiet-badge-morning' : 'quiet-badge-night'
                }`}>
                  {reset.type === 'morning' ? 'Morning Reset' : 'Night Reset'}
                </span>
              </div>
              <div>
                <span className="text-sm font-medium quiet-text-primary">Mood:</span>
                <span className="ml-2 text-sm quiet-text-secondary">{reset.mood}</span>
              </div>
              <div>
                <h3 className="text-sm font-medium quiet-text-primary">Your Input</h3>
                <p className="mt-1 text-sm quiet-text-secondary whitespace-pre-wrap">{reset.raw_input}</p>
              </div>
            </div>
          </div>

          {/* AI Response sections */}
          {reset.summary && (
            <div className="rounded-[32px] quiet-panel p-6 backdrop-blur">
              <h2 className="text-lg font-medium quiet-text-primary mb-4">AI Response</h2>
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium quiet-text-primary">Summary</h3>
                  <p className="mt-1 text-sm quiet-text-secondary whitespace-pre-wrap">{reset.summary}</p>
                </div>

                {reset.type === 'morning' ? (
                  <>
                    {reset.main_focus && (
                      <div>
                        <h3 className="text-sm font-medium quiet-text-primary">Main Focus</h3>
                        <p className="mt-1 text-sm quiet-text-secondary whitespace-pre-wrap">{reset.main_focus}</p>
                      </div>
                    )}
                    {reset.avoid_text && (
                      <div>
                        <h3 className="text-sm font-medium quiet-text-primary">What to Avoid</h3>
                        <p className="mt-1 text-sm quiet-text-secondary whitespace-pre-wrap">{reset.avoid_text}</p>
                      </div>
                    )}
                    {reset.calming_message && (
                      <div>
                        <h3 className="text-sm font-medium quiet-text-primary">Calming Message</h3>
                        <p className="mt-1 text-sm quiet-text-secondary whitespace-pre-wrap">{reset.calming_message}</p>
                      </div>
                    )}
                    {reset.next_action && (
                      <div>
                        <h3 className="text-sm font-medium quiet-text-primary">Next Action</h3>
                        <p className="mt-1 text-sm quiet-text-secondary whitespace-pre-wrap">{reset.next_action}</p>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    {reset.tomorrow_list && (
                      <div>
                        <h3 className="text-sm font-medium quiet-text-primary">Tomorrow&apos;s Focus</h3>
                        <p className="mt-1 text-sm quiet-text-secondary whitespace-pre-wrap">{reset.tomorrow_list}</p>
                      </div>
                    )}
                    {reset.let_go_tonight && (
                      <div>
                        <h3 className="text-sm font-medium quiet-text-primary">Let Go Tonight</h3>
                        <p className="mt-1 text-sm quiet-text-secondary whitespace-pre-wrap">{reset.let_go_tonight}</p>
                      </div>
                    )}
                    {reset.calming_message && (
                      <div>
                        <h3 className="text-sm font-medium quiet-text-primary">Calming Message</h3>
                        <p className="mt-1 text-sm quiet-text-secondary whitespace-pre-wrap">{reset.calming_message}</p>
                      </div>
                    )}
                    {reset.closure_suggestion && (
                      <div>
                        <h3 className="text-sm font-medium quiet-text-primary">Closure Suggestion</h3>
                        <p className="mt-1 text-sm quiet-text-secondary whitespace-pre-wrap">{reset.closure_suggestion}</p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}