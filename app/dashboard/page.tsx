'use client'
import { useState } from 'react'
import { Sidebar } from '@/components/dashboard/Sidebar'
import { MetricCard } from '@/components/dashboard/MetricCard'
import { RoleTile, type RoleData } from '@/components/dashboard/RoleTile'
import { RoleDetailsPanel } from '@/components/dashboard/RoleDetailsPanel'

export const ROLES: RoleData[] = [
  { title: 'KYC Analyst',             score: 9.9, jobs: '18,500', salaryMin: '$85K', salaryMax: '$120K', growth: '18%', aiExposure: 2.1, colSpan: 2, rowSpan: 2 },
  { title: 'Fraud Analyst',           score: 9.5, jobs: '16,200', salaryMin: '$80K', salaryMax: '$115K', growth: '16%', aiExposure: 2.8, colSpan: 1, rowSpan: 1 },
  { title: 'Risk Analyst',            score: 8.9, jobs: '14,800', salaryMin: '$85K', salaryMax: '$125K', growth: '18%', aiExposure: 3.2, colSpan: 1, rowSpan: 1 },
  { title: 'Compliance Analyst',      score: 8.7, jobs: '13,600', salaryMin: '$75K', salaryMax: '$110K', growth: '12%', aiExposure: 3.4, colSpan: 1, rowSpan: 1 },
  { title: 'Financial Crime Analyst', score: 9.2, jobs: '12,900', salaryMin: '$90K', salaryMax: '$130K', growth: '15%', aiExposure: 3.0, colSpan: 2, rowSpan: 1 },
  { title: 'Sanctions Analyst',       score: 8.5, jobs: '8,900',  salaryMin: '$80K', salaryMax: '$115K', growth: '10%', aiExposure: 3.6, colSpan: 1, rowSpan: 1 },
  { title: 'SAR Analyst',             score: 8.3, jobs: '6,800',  salaryMin: '$70K', salaryMax: '$100K', growth: '9%',  aiExposure: 3.8, colSpan: 1, rowSpan: 1 },
  { title: 'OFAC Analyst',            score: 8.2, jobs: '5,900',  salaryMin: '$75K', salaryMax: '$105K', growth: '8%',  aiExposure: 4.1, colSpan: 1, rowSpan: 1 },
  { title: 'BSA Analyst',             score: 9.6, jobs: '15,300', salaryMin: '$85K', salaryMax: '$120K', growth: '17%', aiExposure: 3.5, colSpan: 2, rowSpan: 1 },
  { title: 'Financial Analyst',       score: 6.7, jobs: '9,800',  salaryMin: '$70K', salaryMax: '$110K', growth: '7%',  aiExposure: 5.8, colSpan: 2, rowSpan: 1 },
]

const FILTERS = ['Job Volume', 'Salary', 'Growth Outlook', 'AI Exposure', 'Match Score'] as const
type Filter = typeof FILTERS[number]
const MODE_MAP: Record<Filter, string> = {
  'Job Volume': 'volume', 'Salary': 'salary',
  'Growth Outlook': 'growth', 'AI Exposure': 'ai', 'Match Score': 'match',
}
const NAV = ['Dashboard', 'Explore Roles', 'My Matches', 'Saved Roles', 'Alerts']

const LEGEND: Record<Filter, { low: string; high: string }> = {
  'Job Volume':     { low: 'Fewer Jobs',    high: 'More Jobs' },
  'Salary':         { low: 'Lower Pay',     high: 'Higher Pay' },
  'Growth Outlook': { low: 'Declining',     high: 'Growing' },
  'AI Exposure':    { low: 'Low Exposure',  high: 'High Exposure' },
  'Match Score':    { low: 'Lower Match',   high: 'Higher Match' },
}

export default function DashboardPage() {
  const [colorMode, setColorMode] = useState<Filter>('Match Score')
  const [selected, setSelected] = useState<RoleData>(ROLES[0])

  const leg = LEGEND[colorMode]

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
        <Sidebar roles={ROLES} selected={selected} onSelect={setSelected} parsedRole="Anti Money Laundering (AML)" topScore={9.8} />

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
                  Click any tile to view full BLS data & role details.
                </p>
              </div>
              <button className="text-xs text-blue-400 hover:text-blue-300 shrink-0 transition-colors">GitHub ↗</button>
            </div>
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-5 border-b border-white/10 shrink-0">
            <MetricCard label="TOTAL JOBS"    value="143M"     sub="Across All Occupations" icon="👥" />
            <MetricCard label="AVG OUTLOOK"   value="+3.4%"    sub="Job-Weighted"           icon="📈" />
            <MetricCard label="MEDIAN PAY"    value="$66,800"  sub="Annual Salary"          icon="💵" />
            <MetricCard label="AI EXPOSURE"   value="3.6/10"   sub="Average"                icon="🤖" />
            <MetricCard label="RELATED ROLES" value="10"       sub="In AML Category"        icon="🔗" />
          </div>

          {/* Filter bar */}
          <div className="flex items-center gap-2 px-5 py-3 border-b border-white/10 shrink-0 flex-wrap">
            <span className="text-xs text-gray-500 font-medium mr-1">VIEW BY</span>
            {FILTERS.map(f => (
              <button key={f} onClick={() => setColorMode(f)}
                className={'text-xs px-3 py-1.5 rounded-md transition-all font-medium ' +
                  (colorMode === f
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-gray-200')}>
                {f}
              </button>
            ))}
            <div className="ml-auto flex items-center gap-2 text-xs text-gray-500">
              <span>{leg.low}</span>
              <div className="w-24 h-2 rounded-full bg-gradient-to-r from-red-600 via-yellow-500 to-emerald-500 shadow-sm" />
              <span>{leg.high}</span>
            </div>
          </div>

          {/* Treemap */}
          <div className="flex-1 p-5">
            <div className="grid grid-cols-4 gap-2.5" style={{ gridAutoRows: '108px' }}>
              {ROLES.map(r => (
                <RoleTile key={r.title} role={r} colorMode={MODE_MAP[colorMode]}
                  selected={selected?.title === r.title} onClick={() => setSelected(r)} />
              ))}
            </div>
            <p className="text-xs text-gray-600 text-center mt-4">
              Rectangle size = Number of Jobs &nbsp;·&nbsp; Color = {colorMode} &nbsp;·&nbsp; Click any tile to see details & BLS page
            </p>
          </div>
        </main>

        {/* RIGHT DETAIL PANEL */}
        {selected && <RoleDetailsPanel role={selected} onClose={() => setSelected(ROLES[0])} />}
      </div>
    </div>
  )
}