import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

if (!process.env.OPENAI_API_KEY) throw new Error('OPENAI_API_KEY is not set')
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
const cache = new Map<string, any>()

export async function POST(request: NextRequest) {
  try {
    const { role } = await request.json() as { role: string }
    if (!role) return NextResponse.json({ error: 'Role is required' }, { status: 400 })

    if (cache.has(role)) {
      return NextResponse.json(cache.get(role))
    }

    const systemPrompt = "You are a US recruiting and labor market expert with 20+ years of experience. You return ONLY valid JSON."
    const userPrompt = `Given the job role: "${role}", return a JSON object with this structure:
    {
      "description": "2-sentence overview of the role, its purpose, and value (max 45 words)",
      "responsibilities": ["responsibility 1", "responsibility 2", "responsibility 3", "responsibility 4"],
      "skills": ["skill 1", "skill 2", "skill 3", "skill 4", "skill 5", "skill 6", "skill 7", "skill 8"],
      "companies": ["company 1", "company 2", "company 3", "company 4", "company 5", "company 6"]
    }
    Rules:
    - Tailor everything precisely to the role (e.g. if it is Data Engineer, use data infrastructure/pipelines. If it is KYC Analyst, use compliance/risk. If ML Engineer, use algorithms/training models).
    - Use specific, professional, and modern terminology.
    - Respond ONLY with the JSON object. No Markdown code block packaging.`

    const res = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0.3,
      max_tokens: 400,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ]
    })

    const content = res.choices[0]?.message?.content?.trim() ?? '{}'
    const data = JSON.parse(content)
    cache.set(role, data)

    return NextResponse.json(data)
  } catch (err) {
    console.error('[role-details] error:', err)
    return NextResponse.json({ error: 'Failed to generate role details' }, { status: 500 })
  }
}
