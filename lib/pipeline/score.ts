export interface RoleMatch {
  id: string
  occupation_title: string
  occupation_code: string | null
  median_salary: number
  growth_rate: number
  ai_exposure_score: number
  match_score: number
  salary_min: number
  salary_max: number
  employment_count: number
}

export function computeRoleMatchScore(
  userSkills: string[],
  requiredSkills: Array<{ skill_name: string; importance_score: string }>
): number {
  if (!requiredSkills.length) return 0
  const userLower = userSkills.map((s) => s.toLowerCase().trim())
  const WEIGHTS: Record<string, number> = { high: 3, medium: 2, low: 1 }
  let earned = 0, total = 0
  for (const req of requiredSkills) {
    const name = req.skill_name.toLowerCase()
    const weight = WEIGHTS[req.importance_score] ?? 1
    total += weight
    if (userLower.some((u) => name.includes(u) || u.includes(name))) earned += weight
  }
  return Math.round((earned / total) * 10 * 10) / 10
}

export function salaryRange(median: number): { min: number; max: number } {
  return { min: Math.round(median * 0.85), max: Math.round(median * 1.15) }
}

export function getRelatedRoles(current: RoleMatch, all: RoleMatch[]): string[] {
  return all
    .filter((r) => r.id !== current.id && Math.abs(r.median_salary - current.median_salary) < 30000)
    .sort((a, b) => b.match_score - a.match_score)
    .slice(0, 3)
    .map((r) => r.occupation_title)
}