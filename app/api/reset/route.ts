import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateMorningReset, generateNightReset } from '@/lib/openai/reset'

type ResetRequestBody = {
  type: 'morning' | 'night'
  mood: string
  raw_input: string
}

export async function POST(request: Request) {
  const body = (await request.json()) as ResetRequestBody
  const { type, mood, raw_input } = body
  const rawInput = raw_input

  if (!type || !mood || !rawInput?.trim()) {
    return NextResponse.json({ error: 'Missing required reset data' }, { status: 400 })
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const now = new Date().toISOString()

  const { data: checkIn, error: checkInError } = await supabase
    .from('check_ins')
    .insert({
      user_id: user.id,
      type,
      mood,
      raw_input,
      created_at: now,
    })
    .select('id')
    .single()

  if (checkInError || !checkIn?.id) {
    return NextResponse.json({ error: 'Failed to save check-in' }, { status: 500 })
  }

  try {
    if (type === 'morning') {
      const aiOutput = await generateMorningReset({ mood, rawInput })
      const { error: aiResetError } = await supabase
        .from('ai_resets')
        .insert({
          check_in_id: checkIn.id,
          user_id: user.id,
          summary: aiOutput.summary,
          main_focus: aiOutput.main_focus,
          avoid_text: aiOutput.avoid_text,
          calming_message: aiOutput.calming_message,
          next_action: aiOutput.next_action,
          tomorrow_list: null,
          let_go_tonight: null,
          closure_suggestion: null,
          created_at: now,
        })
        .select('*')
        .single()

      if (aiResetError) {
        console.error('AI reset save failed', aiResetError)
        return NextResponse.json({ error: 'Failed to save AI reset' }, { status: 500 })
      }

      return NextResponse.json({ data: aiOutput }, { status: 201 })
    }

    const aiOutput = await generateNightReset({ mood, rawInput })
    const { error: aiResetError } = await supabase
      .from('ai_resets')
      .insert({
        check_in_id: checkIn.id,
        user_id: user.id,
        summary: aiOutput.summary,
        main_focus: null,
        avoid_text: null,
        calming_message: aiOutput.calming_message,
        next_action: null,
        tomorrow_list: aiOutput.tomorrow_list,
        let_go_tonight: aiOutput.let_go_tonight,
        closure_suggestion: aiOutput.closure_suggestion,
        created_at: now,
      })
      .select('*')
      .single()

    if (aiResetError) {
      console.error('AI reset save failed', aiResetError)
      return NextResponse.json({ error: 'Failed to save AI reset' }, { status: 500 })
    }

    return NextResponse.json({ data: aiOutput }, { status: 201 })
  } catch (error) {
    console.error('AI generation failed', error)
    return NextResponse.json({ error: 'Failed to generate reset. Please try again.' }, { status: 500 })
  }
}
