import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Logo } from '@/components/Logo'
import ReminderSettingsForm, { ReminderSettings } from '@/components/ReminderSettingsForm'

type ReminderSettingsRow = {
  morning_enabled: boolean | null
  morning_time: string | null
  night_enabled: boolean | null
  night_time: string | null
}

const DEFAULT_SETTINGS: ReminderSettings = {
  morning_enabled: false,
  morning_time: '08:00',
  night_enabled: false,
  night_time: '21:00',
}

export default async function RemindersPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data } = await supabase
    .from('reminder_settings')
    .select('morning_enabled, morning_time, night_enabled, night_time')
    .eq('user_id', user.id)
    .maybeSingle()

  const initialSettings: ReminderSettings = {
    morning_enabled: data?.morning_enabled ?? DEFAULT_SETTINGS.morning_enabled,
    morning_time: data?.morning_time || DEFAULT_SETTINGS.morning_time,
    night_enabled: data?.night_enabled ?? DEFAULT_SETTINGS.night_enabled,
    night_time: data?.night_time || DEFAULT_SETTINGS.night_time,
  }

  return (
    <div className="min-h-screen quiet-app-shell">
      <main className="mx-auto max-w-5xl px-6 py-10 sm:px-10">
        <header className="flex flex-col gap-6 rounded-[32px] quiet-panel p-6 shadow-[0_32px_120px_-80px_rgba(15,23,42,0.8)] backdrop-blur sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Logo size="sm" className="mb-4" />
            <h1 className="text-3xl font-semibold quiet-text-primary">Gentle Reminders</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 quiet-text-secondary">
              Choose gentle check-in times that fit your day.
            </p>
          </div>
          <Link href="/dashboard" className="quiet-back-link">
            ← Back to dashboard
          </Link>
        </header>

        <section className="mt-6 rounded-[32px] quiet-panel p-6 backdrop-blur sm:p-8">
          <div className="space-y-6 sm:space-y-8">
            <div className="max-w-2xl space-y-3">
              <p className="text-sm uppercase tracking-[0.18em] quiet-text-secondary">Reminder settings</p>
              <p className="text-sm leading-7 quiet-text-secondary">
                Set quiet reminders that support your morning and night routine without hurry.
              </p>
            </div>
            <ReminderSettingsForm initialSettings={initialSettings} />
          </div>
        </section>
      </main>
    </div>
  )
}
