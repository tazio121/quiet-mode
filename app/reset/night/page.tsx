'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

type NightResetResult = {
  summary: string
  tomorrow_list: string
  let_go_tonight: string
  calming_message: string
  closure_suggestion: string
}

export default function NightReset() {
  const [mood, setMood] = useState('')
  const [rawInput, setRawInput] = useState('')
  const [result, setResult] = useState<NightResetResult | null>(null)
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
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'night',
        mood,
        raw_input: rawInput,
      }),
    })

    const body = await response.json()

    if (!response.ok) {
      setError(body?.error || 'Unable to generate your night reset. Please try again.')
      setLoading(false)
      return
    }

    setResult(body.data)
    setLoading(false)
  }

  if (result) {
    return (
      <div className="min-h-screen bg-[#050508] text-white">
        <main className="mx-auto max-w-2xl px-6 py-10 sm:px-10">
          <div className="rounded-[32px] border border-white/10 bg-white/5 p-6 backdrop-blur">
            <h1 className="text-2xl font-semibold text-white mb-6">Your Night Reset</h1>

            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-medium text-white">Summary</h2>
                <p className="mt-2 text-slate-300">{result.summary}</p>
              </div>

              <div>
                <h2 className="text-lg font-medium text-white">Tomorrow List</h2>
                <p className="mt-2 text-slate-300 whitespace-pre-line">{result.tomorrow_list}</p>
              </div>

              <div>
                <h2 className="text-lg font-medium text-white">Let Go Tonight</h2>
                <p className="mt-2 text-slate-300">{result.let_go_tonight}</p>
              </div>

              <div>
                <h2 className="text-lg font-medium text-white">Calming Message</h2>
                <p className="mt-2 text-slate-300">{result.calming_message}</p>
              </div>

              <div>
                <h2 className="text-lg font-medium text-white">Closure Suggestion</h2>
                <p className="mt-2 text-slate-300">{result.closure_suggestion}</p>
              </div>
            </div>

            <button
              onClick={() => router.push('/dashboard')}
              className="mt-8 inline-flex items-center justify-center rounded-full bg-slate-100 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-200"
            >
              Back to Dashboard
            </button>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#050508] text-white">
      <main className="mx-auto max-w-2xl px-6 py-10 sm:px-10">
        <div className="rounded-[32px] border border-white/10 bg-white/5 p-6 backdrop-blur">
          <h1 className="text-2xl font-semibold text-white mb-6">Night Reset</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-white mb-2">How are you feeling tonight?</label>
              <div className="space-y-2">
                {['Calm', 'Restless', 'Stressed', 'Anxious', 'Drained', 'Grateful'].map((moodOption) => (
                  <label key={moodOption} className="flex items-center">
                    <input
                      type="radio"
                      name="mood"
                      value={moodOption.toLowerCase()}
                      checked={mood === moodOption.toLowerCase()}
                      onChange={(e) => setMood(e.target.value)}
                      className="mr-2"
                    />
                    <span className="text-slate-300">{moodOption}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="rawInput" className="block text-sm font-medium text-white mb-2">
                What's on your mind tonight?
              </label>
              <textarea
                id="rawInput"
                value={rawInput}
                onChange={(e) => setRawInput(e.target.value)}
                className="w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-white placeholder-slate-400 focus:border-slate-500 focus:outline-none"
                rows={4}
                placeholder="Share your thoughts..."
              />
            </div>

            {error ? <p className="text-sm text-rose-400">{error}</p> : null}

            <button
              type="submit"
              disabled={loading || !mood || !rawInput.trim()}
              className="inline-flex items-center justify-center rounded-full bg-slate-100 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Generating reset...' : 'Submit'}
            </button>
          </form>
        </div>
      </main>
    </div>
  )
}
