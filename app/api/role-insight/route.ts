import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

// Simple in-memory cache: key = role+metric → insight string
const cache = new Map<string, string>()

export async function POST(request: NextRequest) {
  const { role, metric, value, domain } = await request.json() as {
    role: string; metric: string; value: string; domain?: string
  }

  const cacheKey = `${role}::${metric}`
  if (cache.has(cacheKey)) return NextResponse.json({ insight: cache.get(cacheKey) })

  const PROMPTS: Record<string, string> = {
    match:   `Explain in 2 sentences what a ${value} match score means for a ${role} applicant in the US market, and one action they should take.`,
    salary:  `Explain in 2 sentences what the ${value} salary range means for ${role} in the US market, and one salary negotiation tip.`,
    growth:  `Explain in 2 sentences what ${value} job growth means for ${role} hiring demand in 2026, and one action to capitalize on this.`,
    ai:      `Explain in 2 sentences what a ${value} AI exposure score means for ${role} job security, and one way to stay competitive.`,
    volume:  `Explain in 2 sentences what ${value} open positions means for ${role} competition and opportunity, and one tip to stand out.`,
  }

  const prompt = PROMPTS[metric] ?? PROMPTS.match

  const res = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    temperature: 0.4,
    max_tokens: 80,
    messages: [
      { role: 'system', content: `You are a US career market expert. Domain context: ${domain ?? 'Technology'}. Be specific, use numbers, max 40 words total.` },
      { role: 'user', content: prompt },
    ],
  })

  const insight = res.choices[0]?.message?.content?.trim() ?? ''
  cache.set(cacheKey, insight)
  return NextResponse.json({ insight })
}