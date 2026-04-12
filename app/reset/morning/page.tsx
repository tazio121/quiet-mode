'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Logo } from '@/components/Logo'

type MorningResetResult = {
  summary: string
  main_focus: string
  avoid_text: string
  calming_message: string
  next_action: string
}

const MOODS = ['Calm', 'Anxious', 'Excited', 'Tired', 'Focused', 'Overwhelmed']

export default function MorningReset() {
  const [mood, setMood] = useState('')
  const [rawInput, setRawInput] = useState('')
  const [result, setResult] = useState<MorningResetResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!mood || !rawInput.trim()) return

    setLoading(true)
    setError('')

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      router.push('/login')
      return
    }

    const response = await fetch('/api/reset', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'morning', mood, raw_input: rawInput }),
    })

    const body = await response.json()

    if (!response.ok) {
      setError(body?.error || 'Unable to generate your morning reset. Please try again.')
      setLoading(false)
      return
    }

    setResult(body.data)
    setLoading(false)
  }

  if (result) {
    return (
      <div className="min-h-screen quiet-app-shell">
        <main className="mx-auto max-w-2xl px-6 py-10 sm:px-10">
          <div className="rounded-[32px] quiet-panel p-6 backdrop-blur sm:p-8">
            <Logo size="sm" className="mb-8" />

            <div className="mb-8 flex items-center gap-3">
              <span className="quiet-badge-morning inline-flex items-center rounded-full px-3 py-1 text-xs font-medium">
                Morning Reset
              </span>
              <h1 className="text-xl font-semibold quiet-text-primary">Your reset is ready</h1>
            </div>

            <div className="space-y-3">
              {[
                { label: 'Summary',         value: result.summary },
                { label: 'Main Focus',       value: result.main_focus },
                { label: 'What to Avoid',    value: result.avoid_text },
                { label: 'Calming Message',  value: result.calming_message },
                { label: 'Next Action',      value: result.next_action },
              ].map(({ label, value }) => (
                <div key={label} className="quiet-inner-card p-4">
                  <p className="text-[10px] font-medium uppercase tracking-[0.18em] quiet-text-secondary">
                    {label}
                  </p>
                  <p className="mt-2 text-sm leading-6 quiet-text-primary">{value}</p>
                </div>
              ))}
            </div>

            <button
              onClick={() => router.push('/dashboard')}
              className="mt-8 inline-flex items-center justify-center rounded-full quiet-primary-cta px-5 py-3 text-sm font-semibold transition"
            >
              Back to Dashboard
            </button>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen quiet-app-shell">
      <main className="mx-auto max-w-2xl px-6 py-10 sm:px-10">
        <div className="rounded-[32px] quiet-panel p-6 backdrop-blur sm:p-8">
          <Logo size="sm" className="mb-8" />

          <div className="mb-8">
            <span className="quiet-badge-morning inline-flex items-center rounded-full px-3 py-1 text-xs font-medium mb-3">
              Morning Reset
            </span>
            <h1 className="mt-3 text-2xl font-semibold quiet-text-primary">Clear your head</h1>
            <p className="mt-2 text-sm leading-6 quiet-text-secondary">
              Check in with yourself. Your reset will be ready in seconds.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div>
              <p className="text-[10px] font-medium uppercase tracking-[0.18em] quiet-text-secondary mb-4">
                How are you feeling this morning?
              </p>
              <div className="flex flex-wrap gap-2">
                {MOODS.map((moodOption) => (
                  <button
                    key={moodOption}
                    type="button"
                    onClick={() => setMood(moodOption.toLowerCase())}
                    className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                      mood === moodOption.toLowerCase()
                        ? 'quiet-filter-active'
                        : 'quiet-secondary-btn'
                    }`}
                  >
                    {moodOption}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label
                htmlFor="rawInput"
                className="block text-[10px] font-medium uppercase tracking-[0.18em] quiet-text-secondary mb-3"
              >
                What&apos;s on your mind?
              </label>
              <textarea
                id="rawInput"
                value={rawInput}
                onChange={(e) => setRawInput(e.target.value)}
                className="quiet-input resize-none"
                rows={5}
                placeholder="Share your thoughts — what's occupying your mind this morning?"
              />
            </div>

            {error && (
              <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !mood || !rawInput.trim()}
              className="inline-flex items-center justify-center rounded-full quiet-primary-cta px-6 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? 'Generating your reset...' : 'Generate Reset'}
            </button>
          </form>
        </div>
      </main>
    </div>
  )
}
