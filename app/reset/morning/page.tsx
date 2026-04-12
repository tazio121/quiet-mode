'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function MorningReset() {
  const [mood, setMood] = useState('')
  const [rawInput, setRawInput] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!mood || !rawInput.trim()) return

    setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      router.push('/login')
      return
    }

    const { error } = await supabase
      .from('check_ins')
      .insert({
        user_id: user.id,
        type: 'morning',
        mood,
        raw_input: rawInput,
        created_at: new Date().toISOString()
      })

    if (error) {
      console.error('Error saving check-in:', error)
      // For now, just log error
    } else {
      setSubmitted(true)
    }
    setLoading(false)
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#050508] text-white">
        <main className="mx-auto max-w-2xl px-6 py-10 sm:px-10">
          <div className="rounded-[32px] border border-white/10 bg-white/5 p-6 backdrop-blur">
            <h1 className="text-2xl font-semibold text-white mb-6">Your Morning Reset</h1>

            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-medium text-white">Summary</h2>
                <p className="mt-2 text-slate-300">This is a placeholder summary based on your input.</p>
              </div>

              <div>
                <h2 className="text-lg font-medium text-white">Main Focus</h2>
                <p className="mt-2 text-slate-300">Placeholder main focus for today.</p>
              </div>

              <div>
                <h2 className="text-lg font-medium text-white">Avoid</h2>
                <p className="mt-2 text-slate-300">Placeholder things to avoid today.</p>
              </div>

              <div>
                <h2 className="text-lg font-medium text-white">Calming Message</h2>
                <p className="mt-2 text-slate-300">Placeholder calming message.</p>
              </div>

              <div>
                <h2 className="text-lg font-medium text-white">Next Action</h2>
                <p className="mt-2 text-slate-300">Placeholder next action to take.</p>
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
          <h1 className="text-2xl font-semibold text-white mb-6">Morning Reset</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-white mb-2">How are you feeling this morning?</label>
              <div className="space-y-2">
                {['Calm', 'Anxious', 'Excited', 'Tired', 'Focused', 'Overwhelmed'].map((moodOption) => (
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
                What's on your mind this morning?
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

            <button
              type="submit"
              disabled={loading || !mood || !rawInput.trim()}
              className="inline-flex items-center justify-center rounded-full bg-slate-100 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Submitting...' : 'Submit'}
            </button>
          </form>
        </div>
      </main>
    </div>
  )
}