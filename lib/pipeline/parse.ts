import OpenAI from 'openai'
import { smartTruncate } from './extract'

if (!process.env.OPENAI_API_KEY) throw new Error('OPENAI_API_KEY is not set')
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export interface ParsedResume {
  candidate_name: string
  current_role: string
  domain: string
  experience_years: number
  skills: string[]
  education: string
  certifications: string[]
  target_market: string
  employability_score: number
  ats_score: number
  primary_role: string
  role_matches: Array<{
    role_name: string
    match_score: number
    match_percent: number
    demand_level: 'Very High' | 'High' | 'Medium' | 'Low'
    ease_of_transition: 'Easy' | 'Moderate' | 'Difficult'
    why_it_matches: string
    interview_potential: 'Very High' | 'High' | 'Medium' | 'Low'
  }>
  application_strategy: Array<{ role: string; percent: number }>
  missing_keywords: string[]
  missing_certifications: string[]
  upskilling: Array<{ skill: string; current_score: number; after_score: number }>
}

const SYSTEM_PROMPT = `You are a Senior Career Counselor and Talent Advisor with 20+ years of US recruiting experience across Technology, Finance, Banking, Data Analytics, Cybersecurity, Healthcare, Engineering, Operations, and HR.

Analyze the resume and return ONLY valid JSON matching this exact structure. Return ALL fields. Do not truncate.

{
  "candidate_name": "string",
  "current_role": "most recent job title from resume",
  "domain": "ONE of: Data Engineering | QA Testing | Software Engineering | Finance & Compliance | Cybersecurity | Data Science | DevOps | Product | Healthcare | Operations",
  "experience_years": number,
  "skills": ["up to 15 specific technical skills"],
  "education": "degree + field + university",
  "certifications": ["certifications if any, else []"],
  "target_market": "US",
  "employability_score": number 0-100,
  "ats_score": number 0-100,
  "primary_role": "single best role title",
  "role_matches": [
    {
      "role_name": "title",
      "match_score": 0.0-10.0,
      "match_percent": 0-100,
      "demand_level": "Very High|High|Medium|Low",
      "ease_of_transition": "Easy|Moderate|Difficult",
      "why_it_matches": "1-sentence explanation of why they fit based on resume",
      "interview_potential": "Very High|High|Medium|Low"
    }
  ],
  "application_strategy": [{"role": "title", "percent": number}],
  "missing_keywords": ["keyword"],
  "missing_certifications": ["cert"],
  "upskilling": [{"skill": "name", "current_score": 0-100, "after_score": 0-100}]
}

ROLE EXPANSION ENGINE (CRITICAL)
Your objective is to identify enough relevant job roles so the candidate can sustain 25 high-quality applications per day for several months.
Do not restrict recommendations to the candidate's current title.

Generate exactly 20-30 roles (Never fewer than 20).

Score them according to this MATCH SCORE COLOR SYSTEM:
- 🟢 DARK GREEN (9.0–10.0 Match / 90–100%): Apply Aggressively. Primary Target Roles.
- 🟩 GREEN (8.0–8.9 Match / 80–89%): Strong Target Roles. Apply Daily.
- 🟨 YELLOW (7.0–7.9 Match / 70–79%): Good Transferable Roles. Apply Regularly.
- 🟧 ORANGE (6.0–6.9 Match / 60–69%): Stretch Roles. Apply Selectively.
- 🟥 RED (Below 6.0): Do Not Prioritize.

Example output for a KYC Analyst resume profile: KYC Analyst (9.8), AML Analyst (9.7), Financial Crime Analyst (9.4), Fraud Analyst (9.1), Compliance Analyst (8.8), Risk Analyst (8.6), etc. Ensure adjacent/stretch roles map accurately to Orange and Yellow tiers rather than dumping all into Red.`

async function generateRoleMatchesFallback(currentRole: string, skills: string[]): Promise<ParsedResume['role_matches']> {
  const res = await openai.chat.completions.create({
    model: 'gpt-4o-mini', temperature: 0, max_tokens: 1500,
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: 'You are a US career counselor. Return JSON: {"roles": [{"role_name":"title","match_score":0-10,"match_percent":0-100,"demand_level":"High","ease_of_transition":"Easy"}]} with 15-20 roles the person can apply to. Include adjacent and stretch roles.' },
      { role: 'user', content: `Current role: ${currentRole}\nSkills: ${skills.join(', ')}\n\nList 15-20 realistic US job roles for this person.` },
    ],
  })
  const data = JSON.parse(res.choices[0]?.message?.content ?? '{"roles":[]}') as { roles: ParsedResume['role_matches'] }
  return data.roles ?? []
}

export async function parseResumeWithGPT(rawText: string): Promise<ParsedResume> {
  const truncated = smartTruncate(rawText, 6000)

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    temperature: 0,
    max_tokens: 4000,
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: `Analyze this resume. Return complete JSON with ALL fields including at least 15 role_matches:\n\n${truncated}` },
    ],
  })

  const content = response.choices[0]?.message?.content
  if (!content) throw new Error('GPT returned empty response')

  const parsed = JSON.parse(content) as ParsedResume

  if (!Array.isArray(parsed.skills))            parsed.skills = []
  if (!Array.isArray(parsed.certifications))    parsed.certifications = []
  if (!Array.isArray(parsed.missing_keywords))  parsed.missing_keywords = []
  if (!Array.isArray(parsed.upskilling))        parsed.upskilling = []
  if (!parsed.primary_role)                     parsed.primary_role = parsed.current_role

  // Fallback: if GPT didn't return role_matches, generate them separately
  if (!Array.isArray(parsed.role_matches) || parsed.role_matches.length < 5) {
    console.log('[parse] role_matches missing or too few — running fallback scoring')
    parsed.role_matches = await generateRoleMatchesFallback(parsed.current_role, parsed.skills)
  }

  return parsed
}