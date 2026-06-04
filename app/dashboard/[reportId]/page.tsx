import { serviceSupabase } from '@/lib/supabase/service'
import { notFound } from 'next/navigation'
import DashboardClient from './DashboardClient'
import type { RoleData } from '@/components/dashboard/RoleTile'

export default async function DashboardPage({ params }: { params: Promise<{ reportId: string }> }) {
  const { reportId } = await params

  const { data: report } = await serviceSupabase
    .from('career_reports')
    .select('report_json, recommended_roles(role_title,match_score,reason,rank)')
    .eq('id', reportId)
    .single()

  if (!report) notFound()

  const raw = ((report.recommended_roles as any[]) ?? []).sort((a, b) => a.rank - b.rank)

  const roles: RoleData[] = raw.map((r: any, i: number) => {
    const meta = (() => { try { return JSON.parse(r.reason) } catch { return {} } })()
    const colSpan = i === 0 ? 2 : i < 5 ? 1 : i < 9 ? 1 : 2
    const rowSpan = i === 0 ? 2 : 1
    return {
      rank:       r.rank,
      title:      r.role_title,
      score:      r.match_score,
      jobs:       meta.employment_count > 0
                    ? (meta.employment_count as number).toLocaleString()
                    : 'N/A',
      salaryMin:  meta.salary_min  ? '$' + Math.round(meta.salary_min  / 1000) + 'K' : 'N/A',
      salaryMax:  meta.salary_max  ? '$' + Math.round(meta.salary_max  / 1000) + 'K' : 'N/A',
      growth:     meta.growth_rate ? meta.growth_rate + '%' : '0%',
      aiExposure: meta.ai_exposure_score ?? 5,
      colSpan,
      rowSpan,
    }
  })

  const parsed     = (report.report_json as any)?.parsed ?? {}
  const topScore   = roles[0]?.score ?? 0

  return (
    <DashboardClient
      roles={roles}
      parsedRole={parsed.current_role ?? ''}
      parsedSkills={parsed.skills ?? []}
      domain={parsed.domain ?? ''}
      atsScore={parsed.ats_score ?? 0}
      employabilityScore={parsed.employability_score ?? 0}
      topScore={topScore}
    />
  )
}