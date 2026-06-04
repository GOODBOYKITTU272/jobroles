import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
const cache = new Map<string, string>()

const ICONS: Record<string, string> = {
  match:  'Match Score',
  salary: 'Salary Range',
  growth: 'Growth Outlook',
  ai:     'AI Exposure',
  volume: 'Job Volume',
}

const PROMPTS: Record<string, (role: string, value: string) => string> = {
  match:  (r, v) => `A ${r} has a match score of ${v}. In 2 sentences: what this means for the candidate's interview chances in the US, and one specific action to improve it.`,
  salary: (r, v) => `A ${r} earns ${v} in the US market. In 2 sentences: how this compares to the industry median and which skills push salary toward the upper band.`,
  growth: (r, v) => `${r} jobs are growing at ${v} in the US. In 2 sentences: what is driving this growth and the best timing strategy for applications.`,
  ai:     (r, v) => `${r} has an AI exposure score of ${v} out of 10. In 2 sentences: explain what tasks AI can and cannot replace in this role, and how to future-proof the career.`,
  volume: (r, v) => `There are ${v} ${r} positions open in the US. In 2 sentences: what this means for competition and one tip to stand out from other applicants.`,
}

export async function POST(request: NextRequest) {
  const { role, metric, value } = await request.json() as {
    role: string; metric: string; value: string
  }

  const cacheKey = `${role}::${metric}`
  if (cache.has(cacheKey)) return NextResponse.json({ insight: cache.get(cacheKey), label: ICONS[metric] })

  const promptFn = PROMPTS[metric] ?? PROMPTS.match
  const prompt = promptFn(role, value)

  const res = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    temperature: 0.3,
    max_tokens: 90,
    messages: [
      { role: 'system', content: 'You are a US labor market expert. Be specific. Use real numbers. Maximum 45 words. No fluff.' },
      { role: 'user', content: prompt },
    ],
  })

  const insight = res.choices[0]?.message?.content?.trim() ?? ''
  cache.set(cacheKey, insight)
  return NextResponse.json({ insight, label: ICONS[metric] })
}