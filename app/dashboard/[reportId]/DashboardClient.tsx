'use client'
import { useState } from 'react'
import { Sidebar } from '@/components/dashboard/Sidebar'
import { MetricCard } from '@/components/dashboard/MetricCard'
import { RoleTile, type RoleData } from '@/components/dashboard/RoleTile'
import { RoleDetailsPanel } from '@/components/dashboard/RoleDetailsPanel'

const FILTERS = ['Job Volume', 'Salary', 'Growth Outlook', 'AI Exposure', 'Match Score'] as const
type Filter = typeof FILTERS[number]
const MODE_MAP: Record<Filter, string> = {
  'Job Volume': 'volume', 'Salary': 'salary',
  'Growth Outlook': 'growth', 'AI Exposure': 'ai', 'Match Score': 'match',
}
const LEGEND: Record<Filter, { low: string; high: string }> = {
  'Job Volume':     { low: 'Fewer Jobs',   high: 'More Jobs' },
  'Salary':         { low: 'Lower Pay',    high: 'Higher Pay' },
  'Growth Outlook': { low: 'Declining',    high: 'Growing' },
  'AI Exposure':    { low: 'Low Exposure', high: 'High Exposure' },
  'Match Score':    { low: 'Lower Match',  high: 'Higher Match' },
}
const NAV = ['Dashboard', 'Explore Roles', 'My Matches', 'Saved Roles', 'Alerts']

export interface DashboardProps {
  roles: RoleData[]
  parsedRole: string
  parsedSkills: string[]
  domain: string
  atsScore: number
  employabilityScore: number
  topScore: number
}

export default function DashboardClient({
  roles, parsedRole, parsedSkills, domain, atsScore, employabilityScore, topScore
}: DashboardProps) {
  const [colorMode, setColorMode] = useState<Filter>('Match Score')
  const [selected, setSelected] = useState<RoleData | null>(roles[0] ?? null)
  const [insight, setInsight] = useState<string>('')
  const [insightLoading, setInsightLoading] = useState(false)
  const insightCache = useState(() => new Map<string,string>())[0]

  const leg = LEGEND[colorMode]

  async function fetchInsight(role: RoleData, mode: Filter) {
    const key = role.title + '::' + mode
    if (insightCache.has(key)) { setInsight(insightCache.get(key)!); return }
    setInsightLoading(true); setInsight('')
    const mv = mode === 'Match Score' ? role.score.toFixed(1)+'/10' : mode === 'Salary' ? role.salaryMin+'-'+role.salaryMax : mode === 'Growth Outlook' ? '+'+role.growth : mode === 'AI Exposure' ? role.aiExposure+'/10' : role.jobs+' jobs'
    const res = await fetch('/api/role-insight', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ role: role.title, metric: MODE_MAP[mode], value: mv }) })
    const data = await res.json() as { insight: string }
    insightCache.set(key, data.insight); setInsight(data.insight); setInsightLoading(false)
  }
  const totalJobs = roles.reduce((s, r) => s + parseInt(r.jobs.replace(/,/g, '') || '0'), 0)
  const avgGrowth = roles.length
    ? Math.round(roles.reduce((s, r) => s + parseFloat(r.growth), 0) / roles.length)
    : 0
  const avgAI = roles.length
    ? (roles.reduce((s, r) => s + r.aiExposure, 0) / roles.length).toFixed(1)
    : '0'
  const salaries = roles.flatMap(r => [
    parseInt(r.salaryMin.replace(/\D/g, '')) || 0,
    parseInt(r.salaryMax.replace(/\D/g, '')) || 0,
  ]).filter(Boolean)
  const medianPay = salaries.length
    ? Math.round(salaries.reduce((a, b) => a + b, 0) / salaries.length / 1000)
    : 0

  return (
    <div className="flex flex-col min-h-screen bg-[#0d0f1a] text-white font-sans">

      {/* NAVBAR */}
      <nav className="flex items-center justify-between px-5 py-2.5 bg-[#13151f]/90 backdrop-blur border-b border-white/10 sticky top-0 z-20">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-6 bg-blue-500 rounded flex items-center justify-center text-xs font-bold">A</div>
            <span className="font-bold text-white text-sm tracking-tight">ApplyWizz</span>
            <span className="text-xs text-gray-500 font-normal ml-1">CAREER GPS</span>
          </div>
          <div className="hidden md:flex items-center gap-0.5">
            {NAV.map(n => (
              <button key={n} className={'text-xs px-3 py-1.5 rounded-md transition-all ' +
                (n === 'Dashboard' ? 'text-white bg-white/10 font-medium' : 'text-gray-400 hover:text-white hover:bg-white/5')}>
                {n}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="text-xs text-gray-400 hover:text-white transition-colors">How it works</button>
          <button className="text-xs text-gray-400 hover:text-white transition-colors">Share</button>
          <button className="text-xs bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-md font-medium transition-colors shadow-lg shadow-blue-500/20">
            Export
          </button>
        </div>
      </nav>

      {/* BODY */}
      <div className="flex flex-1 overflow-hidden">

        {/* SIDEBAR */}
        <Sidebar roles={roles} selected={selected} onSelect={setSelected} parsedRole={parsedRole} topScore={topScore} />

        {/* MAIN */}
        <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">

          {/* Page header */}
          <div className="px-6 pt-5 pb-4 border-b border-white/10">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-xl font-bold tracking-tight">U.S. Job Market Visualizer</h1>
                <p className="text-xs text-gray-500 mt-1 max-w-2xl">
                  This tool visualizes 342 occupations from the Bureau of Labor Statistics Occupational Outlook Handbook,
                  covering 143M jobs across the US economy. Each rectangle area is proportional to total employment.
                  Click any tile to view full BLS data &amp; role details.
                </p>
              </div>
              <button className="text-xs text-blue-400 hover:text-blue-300 shrink-0 transition-colors">GitHub ↗</button>
            </div>
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-5 border-b border-white/10 shrink-0">
            <MetricCard label="TOTAL JOBS"    value={totalJobs > 0 ? (totalJobs / 1000).toFixed(0) + 'K' : '143M'} sub="Across All Occupations" icon="👥" />
            <MetricCard label="AVG OUTLOOK"   value={'+' + avgGrowth + '%'}   sub="Job-Weighted"      icon="📈" />
            <MetricCard label="MEDIAN PAY"    value={medianPay > 0 ? '$' + medianPay + 'K' : '$66,800'} sub="Annual Salary" icon="💵" />
            <MetricCard label="AI EXPOSURE"   value={avgAI + '/10'}            sub="Average"           icon="🤖" />
            <MetricCard label="RELATED ROLES" value={String(roles.length)}     sub={'In ' + (domain || 'Your') + ' Category'} icon="🔗" />
          </div>

          {/* Filter bar */}
          <div className="flex items-center gap-2 px-5 py-3 border-b border-white/10 shrink-0 flex-wrap">
            <span className="text-xs text-gray-500 font-medium mr-1">VIEW BY</span>
            {FILTERS.map(f => (
              <button key={f} onClick={() => { setColorMode(f); if (selected) fetchInsight(selected, f) }}
                className={'text-xs px-3 py-1.5 rounded-md transition-all font-medium ' +
                  (colorMode === f
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-gray-200')}>
                {f}
              </button>
            ))}
            <div className="ml-auto flex items-center gap-2 text-xs text-gray-500">
              <span>{leg.low}</span>
              <div className="w-24 h-2 rounded-full bg-gradient-to-r from-red-600 via-yellow-500 to-emerald-500" />
              <span>{leg.high}</span>
            </div>
          </div>

          {/* Treemap */}
          <div className="flex-1 p-5">
            {roles.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                <p className="text-4xl mb-3">📊</p>
                <p className="text-sm">No roles matched. Try uploading a more detailed resume.</p>
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-2.5" style={{ gridAutoRows: '108px' }}>
                {roles.map(r => (
                  <RoleTile key={r.title} role={r} colorMode={MODE_MAP[colorMode]}
                    selected={selected?.title === r.title} onClick={() => { setSelected(r); fetchInsight(r, colorMode) }} />
                ))}
              </div>
            )}
            <p className="text-xs text-gray-600 text-center mt-4">
              Rectangle size = Number of Jobs &nbsp;·&nbsp; Color = {colorMode} &nbsp;·&nbsp;
              Click any tile to see details &amp; BLS page
            </p>
          </div>
        </main>

        {/* RIGHT DETAIL PANEL */}
        {selected && (
          <RoleDetailsPanel role={selected} onClose={() => setSelected(roles[0] ?? null)} />
        )}
      </div>
    </div>
  )
}