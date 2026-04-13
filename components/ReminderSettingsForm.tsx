'use client'

import { FormEvent, useState } from 'react'

export type ReminderSettings = {
  morning_enabled: boolean
  morning_time: string
  night_enabled: boolean
  night_time: string
}

type ReminderSettingsFormProps = {
  initialSettings: ReminderSettings
}

const DEFAULT_MORNING_TIME = '08:00'
const DEFAULT_NIGHT_TIME = '21:00'

export default function ReminderSettingsForm({ initialSettings }: ReminderSettingsFormProps) {
  const [morningEnabled, setMorningEnabled] = useState(
    initialSettings.morning_enabled ?? false
  )
  const [morningTime, setMorningTime] = useState(
    initialSettings.morning_time || DEFAULT_MORNING_TIME
  )
  const [nightEnabled, setNightEnabled] = useState(
    initialSettings.night_enabled ?? false
  )
  const [nightTime, setNightTime] = useState(
    initialSettings.night_time || DEFAULT_NIGHT_TIME
  )
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch('/api/reminders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          morning_enabled: morningEnabled,
          morning_time: morningTime,
          night_enabled: nightEnabled,
          night_time: nightTime,
        }),
        cache: 'no-store',
      })

      const body = await response.json()

      if (!response.ok) {
        setError(body?.error || 'Unable to save reminder settings. Please try again.')
      } else {
        setSuccess('Reminder settings saved.')
      }
    } catch (err) {
      setError('Unable to save reminder settings. Please try again.')
      console.error('Reminder save failed', err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <div className="space-y-4 rounded-[24px] border border-white/10 bg-white/5 p-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] quiet-text-secondary">
              Morning reminder
            </p>
            <p className="mt-2 text-sm leading-6 quiet-text-secondary">
              Morning reminders help you begin with intention.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setMorningEnabled((current) => !current)}
            className={`inline-flex items-center rounded-full px-4 py-2 text-sm font-semibold transition ${
              morningEnabled ? 'quiet-primary-cta' : 'quiet-secondary-btn'
            }`}
          >
            {morningEnabled ? 'Enabled' : 'Off'}
          </button>
        </div>

        <div className="grid gap-3 sm:grid-cols-[1fr_140px]">
          <label className="space-y-2">
            <span className="block text-sm font-medium quiet-text-primary">
              Set the time
            </span>
            <input
              type="time"
              value={morningTime}
              onChange={(event) => setMorningTime(event.target.value)}
              className="quiet-input"
              aria-label="Morning reminder time"
            />
          </label>
        </div>

        <p className="text-xs leading-5 quiet-text-secondary">
          Set a gentle reminder to check in at the start of your day.
        </p>
      </div>

      <div className="space-y-4 rounded-[24px] border border-white/10 bg-white/5 p-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] quiet-text-secondary">
              Night reminder
            </p>
            <p className="mt-2 text-sm leading-6 quiet-text-secondary">
              Night reminders help you return before sleep.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setNightEnabled((current) => !current)}
            className={`inline-flex items-center rounded-full px-4 py-2 text-sm font-semibold transition ${
              nightEnabled ? 'quiet-primary-cta' : 'quiet-secondary-btn'
            }`}
          >
            {nightEnabled ? 'Enabled' : 'Off'}
          </button>
        </div>

        <div className="grid gap-3 sm:grid-cols-[1fr_140px]">
          <label className="space-y-2">
            <span className="block text-sm font-medium quiet-text-primary">
              Set the time
            </span>
            <input
              type="time"
              value={nightTime}
              onChange={(event) => setNightTime(event.target.value)}
              className="quiet-input"
              aria-label="Night reminder time"
            />
          </label>
        </div>

        <p className="text-xs leading-5 quiet-text-secondary">
          Keep this check-in time calm and easy to return to.
        </p>
      </div>

      {error ? (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4">
          <p className="text-sm text-red-200">{error}</p>
        </div>
      ) : null}

      {success ? (
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4">
          <p className="text-sm text-emerald-100">{success}</p>
        </div>
      ) : null}

      <button
        type="submit"
        disabled={saving}
        className="inline-flex items-center justify-center rounded-full quiet-primary-cta px-6 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50"
      >
        {saving ? 'Saving settings…' : 'Save reminder settings'}
      </button>
    </form>
  )
}
