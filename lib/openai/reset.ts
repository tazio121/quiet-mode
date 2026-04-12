import { openai } from './client'

export type MorningResetResult = {
  summary: string
  main_focus: string
  avoid_text: string
  calming_message: string
  next_action: string
}

export type NightResetResult = {
  summary: string
  tomorrow_list: string
  let_go_tonight: string
  calming_message: string
  closure_suggestion: string
}

const MORNING_SYSTEM_PROMPT = `You are a concise morning reset guide. Keep the tone calm, clear, direct, supportive, and masculine. Do not sound harsh, robotic, or like an AI. Avoid therapy jargon, cheesy affirmations, medical claims, and wellness clichés such as journey, embrace, manifest, unlock.`

const NIGHT_SYSTEM_PROMPT = `You are a practical night reset guide. Keep the tone calming, quiet, and steady. Do not sound fluffy, robotic, or like an AI. Avoid generic meditation language, therapy jargon, medical claims, and wellness clichés such as journey, embrace, manifest, unlock.`

function extractJsonObject(text: string) {
  const cleaned = text
    .replace(/```json/g, '')
    .replace(/```/g, '')
    .replace(/\r/g, '')
    .trim()

  const start = cleaned.indexOf('{')
  const end = cleaned.lastIndexOf('}')

  if (start === -1 || end === -1 || end <= start) {
    throw new Error('OpenAI response did not contain valid JSON')
  }

  return cleaned.slice(start, end + 1)
}

function parseOpenAIJson<T>(text: string): T {
  const jsonText = extractJsonObject(text)
  try {
    return JSON.parse(jsonText) as T
  } catch (error) {
    throw new Error(`Unable to parse OpenAI JSON response: ${(error as Error).message}`)
  }
}

function ensureString(value: unknown, name: string): string {
  if (typeof value !== 'string' || !value.trim()) {
    throw new Error(`Missing or invalid field: ${name}`)
  }
  return value.trim()
}

function validateMorningResponse(raw: unknown): MorningResetResult {
  const parsed = raw as Record<string, unknown>
  return {
    summary: ensureString(parsed.summary, 'summary'),
    main_focus: ensureString(parsed.main_focus, 'main_focus'),
    avoid_text: ensureString(parsed.avoid_text, 'avoid_text'),
    calming_message: ensureString(parsed.calming_message, 'calming_message'),
    next_action: ensureString(parsed.next_action, 'next_action'),
  }
}

function validateNightResponse(raw: unknown): NightResetResult {
  const parsed = raw as Record<string, unknown>
  return {
    summary: ensureString(parsed.summary, 'summary'),
    tomorrow_list: ensureString(parsed.tomorrow_list, 'tomorrow_list'),
    let_go_tonight: ensureString(parsed.let_go_tonight, 'let_go_tonight'),
    calming_message: ensureString(parsed.calming_message, 'calming_message'),
    closure_suggestion: ensureString(parsed.closure_suggestion, 'closure_suggestion'),
  }
}

async function callOpenAI(messages: Array<{ role: 'system' | 'user'; content: string }>) {
  const completion = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages,
    temperature: 0.7,
    max_tokens: 300,
  })

  const content = completion.choices?.[0]?.message?.content
  if (!content) {
    throw new Error('OpenAI response was empty')
  }
  return content
}

export async function generateMorningReset({ mood, rawInput }: { mood: string; rawInput: string }): Promise<MorningResetResult> {
  const userMessage = `Create a JSON object with exactly these keys: summary, main_focus, avoid_text, calming_message, next_action.\n\nMood: ${mood}\nInput: ${rawInput}\n\nKeep each value short, practical, and emotionally grounding. Do not use markdown, lists, or extra keys. Do not mention AI. Do not sound robotic.`

  const responseText = await callOpenAI([
    { role: 'system', content: MORNING_SYSTEM_PROMPT },
    { role: 'user', content: userMessage },
  ])

  const parsed = parseOpenAIJson<MorningResetResult>(responseText)
  return validateMorningResponse(parsed)
}

export async function generateNightReset({ mood, rawInput }: { mood: string; rawInput: string }): Promise<NightResetResult> {
  const userMessage = `Create a JSON object with exactly these keys: summary, tomorrow_list, let_go_tonight, calming_message, closure_suggestion.\n\nMood: ${mood}\nInput: ${rawInput}\n\nKeep each value short, practical, and emotionally settling. Separate what needs action tomorrow from what should be released tonight. Do not use markdown, lists, or extra keys. Do not mention AI. Do not sound robotic.`

  const responseText = await callOpenAI([
    { role: 'system', content: NIGHT_SYSTEM_PROMPT },
    { role: 'user', content: userMessage },
  ])

  const parsed = parseOpenAIJson<NightResetResult>(responseText)
  return validateNightResponse(parsed)
}
