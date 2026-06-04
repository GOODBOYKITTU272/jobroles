import { serviceSupabase } from '../supabase/service'
import { salaryRange, getRelatedRoles, type RoleMatch } from './score'
import type { ParsedResume } from './parse'

export interface MatchedRole extends RoleMatch { related_roles: string[] }

export async function findTopMatchedRoles(parsed: ParsedResume): Promise<MatchedRole[]> {
  // GPT already scored all roles — use that directly
  const gptRoles = parsed.role_matches
  if (!gptRoles?.length) throw new Error('No role matches returned by AI')

  // Fetch market data: look up each role by name in role_aliases → roles → role_market_mapping → occupations
  const { data: allAliases } = await serviceSupabase
    .from('role_aliases')
    .select('alias, role_id, roles(id,role_name,role_family)')

  const { data: mappings } = await serviceSupabase
    .from('role_market_mapping')
    .select('role_id, occupations(median_salary,growth_rate,ai_exposure_score,employment_count)')

  const marketByRoleId = new Map<string, any>()
  for (const m of mappings ?? []) {
    if (m.occupations && !marketByRoleId.has(m.role_id)) {
      marketByRoleId.set(m.role_id, m.occupations)
    }
  }

  // Build a lookup: alias → { role_id, role_name, role_family }
  const aliasLookup = new Map<string, { role_id: string; role_name: string; role_family: string }>()
  for (const a of allAliases ?? []) {
    const role = a.roles as any
    if (role) aliasLookup.set(a.alias, { role_id: role.id, role_name: role.role_name, role_family: role.role_family })
  }

  const scored: RoleMatch[] = gptRoles.map((gr) => {
    const nameLower = gr.role_name.toLowerCase()

    // Find matching DB role via alias
    let dbMatch = aliasLookup.get(nameLower)
    if (!dbMatch) {
      // Partial match
      for (const [alias, info] of aliasLookup) {
        if (nameLower.includes(alias) || alias.includes(nameLower)) {
          dbMatch = info
          break
        }
      }
    }

    const market = dbMatch ? marketByRoleId.get(dbMatch.role_id) : null
    const median = market?.median_salary ?? estimateSalaryFromRole(gr.role_name)
    const { min, max } = salaryRange(median)

    return {
      id: dbMatch?.role_id ?? gr.role_name,
      occupation_title: gr.role_name,
      occupation_code: null,
      median_salary: median,
      growth_rate: market?.growth_rate ?? estimateGrowth(gr.demand_level),
      ai_exposure_score: market?.ai_exposure_score ?? 5,
      match_score: gr.match_score,
      salary_min: min,
      salary_max: max,
      employment_count: market?.employment_count ?? 0,
    }
  })

  const top20 = scored.sort((a, b) => b.match_score - a.match_score).slice(0, 20)
  return top20.map((role) => ({ ...role, related_roles: getRelatedRoles(role, top20) }))
}

// Fallbacks when no DB market data exists for a role
function estimateSalaryFromRole(roleName: string): number {
  const name = roleName.toLowerCase()
  if (name.includes('architect') || name.includes('principal') || name.includes('director')) return 150000
  if (name.includes('senior') || name.includes('lead') || name.includes('staff')) return 130000
  if (name.includes('manager') || name.includes('vp') || name.includes('head')) return 140000
  if (name.includes('engineer') || name.includes('developer') || name.includes('scientist')) return 110000
  if (name.includes('analyst') || name.includes('specialist')) return 85000
  return 90000
}

function estimateGrowth(demandLevel: string): number {
  switch (demandLevel) {
    case 'Very High': return 20
    case 'High': return 12
    case 'Medium': return 6
    default: return 2
  }
}