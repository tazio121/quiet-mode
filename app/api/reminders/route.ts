import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

type ReminderSettingsBody = {
  morning_enabled: boolean
  morning_time: string
  night_enabled: boolean
  night_time: string
}

const validTimePattern = /^\d{2}:\d{2}$/

export async function POST(request: Request) {
  const body = (await request.json()) as ReminderSettingsBody
  const { morning_enabled, morning_time, night_enabled, night_time } = body

  if (
    typeof morning_enabled !== 'boolean' ||
    typeof night_enabled !== 'boolean' ||
    typeof morning_time !== 'string' ||
    typeof night_time !== 'string' ||
    !validTimePattern.test(morning_time) ||
    !validTimePattern.test(night_time)
  ) {
    return NextResponse.json({ error: 'Invalid reminder settings' }, { status: 400 })
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const getResult = await supabase
    .from('reminder_settings')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle()

  if (getResult.error) {
    console.error('Reminder settings query failed', getResult.error)
    return NextResponse.json({ error: 'Failed to save reminder settings' }, { status: 500 })
  }

  const row = {
    user_id: user.id,
    morning_enabled,
    morning_time,
    night_enabled,
    night_time,
  }

  if (!getResult.data) {
    const insertResult = await supabase.from('reminder_settings').insert(row)
    if (insertResult.error) {
      console.error('Reminder settings insert failed', insertResult.error)
      return NextResponse.json({ error: 'Failed to save reminder settings' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Reminder settings saved.' }, { status: 201 })
  }

  const updateResult = await supabase
    .from('reminder_settings')
    .update(row)
    .eq('id', getResult.data.id)

  if (updateResult.error) {
    console.error('Reminder settings update failed', updateResult.error)
    return NextResponse.json({ error: 'Failed to save reminder settings' }, { status: 500 })
  }

  return NextResponse.json({ message: 'Reminder settings saved.' }, { status: 200 })
}
