'use client'
import { useState, useEffect } from 'react'
import type { RoleData } from './RoleTile'

interface Props { 
  role: RoleData; 
  education?: string; 
  onClose: () => void;
  insight?: string;
  insightLoading?: boolean;
  insightMetric?: string;
  onMetricSelect?: (metric: 'Job Volume' | 'Salary' | 'Growth Outlook' | 'AI Exposure' | 'Match Score') => void;
}

const COMPANIES: Record<string, string[]> = {
  default: ['JPMorgan Chase','Citi','Wells Fargo','Bank of America','HSBC','American Express','Goldman Sachs','Morgan Stanley'],
}

const SKILLS: Record<string, string[]> = {
  'KYC Analyst': ['Customer Due Diligence','Identity Verification','AML Monitoring','Fraud Detection','Transaction Monitoring','Regulatory Reporting','Sanctions Screening','Risk Assessment'],
  'Fraud Analyst': ['Fraud Detection','Pattern Analysis','Case Management','Financial Investigation','Data Analysis','SQL','Risk Modeling','Chargeback Analysis'],
  default: ['AML Compliance','Risk Assessment','Regulatory Reporting','Data Analysis','Investigation','Financial Crime','Transaction Monitoring'],
}

const TABS = ['Overview','Market Data','Skills'] as const
type Tab = typeof TABS[number]

function scoreColor(s: number) {
  if (s >= 9) return 'text-emerald-400'
  if (s >= 7) return 'text-green-400'
  if (s >= 5) return 'text-yellow-400'
  return 'text-orange-400'
}

function aiColor(ai: number) {
  return ai <= 3 ? 'text-emerald-400' : ai <= 5 ? 'text-yellow-400' : 'text-red-400'
}

interface RoleDetailsData {
  description: string
  responsibilities: string[]
  skills: string[]
  companies: string[]
}

const defaultDetails: RoleDetailsData = {
  description: "Professionals in this field design, build, and optimize systems to drive organizational value, ensure operational excellence, and align technical executions with business needs.",
  responsibilities: [
    'Deploy, monitor, and maintain core business systems',
    'Analyze patterns and troubleshoot operational bottlenecks',
    'Maintain industry standard security practices and regulatory reports',
    'Collaborate across cross-functional teams to align project deliverables'
  ],
  skills: ['Problem Solving', 'Data Analysis', 'Critical Thinking', 'System Design', 'Communication', 'Collaborative Tools', 'Project Management'],
  companies: ['JPMorgan Chase', 'Citi', 'Wells Fargo', 'Bank of America', 'HSBC', 'American Express']
}

const detailsCache = new Map<string, RoleDetailsData>()

export function RoleDetailsPanel({ role, education, onClose, insight, insightLoading, insightMetric, onMetricSelect }: Props) {
  const [tab, setTab] = useState<Tab>('Overview')
  const [details, setDetails] = useState<RoleDetailsData>(defaultDetails)
  const [loading, setLoading] = useState(false)

  // Dynamic fetch effect when role title changes
  useEffect(() => {
    let active = true
    async function fetchDetails() {
      const cacheKey = role.title
      if (detailsCache.has(cacheKey)) {
        setDetails(detailsCache.get(cacheKey)!)
        return
      }
      setLoading(true)
      try {
        const res = await fetch('/api/role-details', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ role: role.title })
        })
        if (!res.ok) throw new Error()
        const data = await res.json() as RoleDetailsData
        if (data.description && active) {
          detailsCache.set(cacheKey, data)
          setDetails(data)
        }
      } catch {
        // Fallback gracefully on network error
        if (active) setDetails(defaultDetails)
      } finally {
        if (active) setLoading(false)
      }
    }
    fetchDetails()
    return () => { active = false }
  }, [role.title])

  const companies = details.companies
  const skills = details.skills

  return (
    <aside className="w-80 shrink-0 bg-[#13151f] border-l border-white/10 flex flex-col h-screen sticky top-0 overflow-y-auto">

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <button onClick={onClose} className="text-xs text-gray-400 hover:text-white transition-colors flex items-center gap-1">
          ← Back to All Roles
        </button>
        <button className="text-xs text-gray-400 hover:text-red-400 transition-colors">♡ Save</button>
      </div>

      {/* Role hero */}
      <div className="px-4 py-4 border-b border-white/10 bg-gradient-to-br from-white/5 to-transparent">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-sm font-bold shadow-lg shadow-blue-500/30">
              {role.title.slice(0,2).toUpperCase()}
            </div>
            <div>
              <span className="text-xs bg-emerald-500 text-black px-2 py-0.5 rounded-full font-bold">Top Match</span>
              <h2 className="text-base font-bold text-white mt-0.5 leading-tight">{role.title}</h2>
            </div>
          </div>
          <div className="text-right shrink-0">
            <p className={`text-2xl font-bold ${scoreColor(role.score)}`}>{role.score.toFixed(1)}</p>
            <p className="text-xs text-gray-500">/10 Match</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/10 overflow-x-auto shrink-0">
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={'text-xs px-3 py-2.5 shrink-0 transition-all border-b-2 font-medium ' +
              (tab === t ? 'border-blue-500 text-white' : 'border-transparent text-gray-500 hover:text-gray-300')}>
            {t}
          </button>
        ))}
      </div>

      {tab === 'Overview' && (
        <div className="p-4 space-y-5 flex-1">
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-widest mb-2">About This Role</p>
            <p className="text-xs text-gray-300 leading-relaxed">
              {loading ? (
                <span className="flex items-center gap-2 text-gray-500 py-1">
                  <span className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  Loading role overview...
                </span>
              ) : (
                details.description
              )}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'Jobs in USA',    value: role.jobs,                         metric: 'Job Volume' as const,     hi: '' },
              { label: 'Salary Range',   value: `${role.salaryMin}–${role.salaryMax}`, metric: 'Salary' as const,         hi: 'text-emerald-400' },
              { label: 'Job Growth',     value: `+${role.growth}`,                metric: 'Growth Outlook' as const, hi: 'text-emerald-400' },
              { label: 'AI Exposure',    value: `${role.aiExposure}/10`,           metric: 'AI Exposure' as const,    hi: aiColor(role.aiExposure) },
              { label: 'Education',      value: education || "Bachelor's",         metric: null,                      hi: 'truncate max-w-[130px] inline-block' },
              { label: 'Demand Level',   value: role.score >= 9 ? 'High' : 'Medium', metric: 'Match Score' as const,    hi: role.score >= 9 ? 'text-emerald-400' : 'text-yellow-400' },
            ].map(s => (
              <div 
                key={s.label} 
                onClick={() => s.metric && onMetricSelect?.(s.metric)}
                className={`bg-white/5 rounded-lg p-2.5 transition-all group/metric ${
                  s.metric 
                    ? 'cursor-pointer hover:bg-white/10 hover:border-blue-500/40 border border-transparent active:scale-[0.98]' 
                    : 'border border-transparent'
                }`}
              >
                <p className="text-[10px] text-gray-500 flex items-center justify-between font-medium">
                  <span>{s.label}</span>
                  {s.metric && (
                    <span className="text-[10px] text-blue-400 opacity-0 group-hover/metric:opacity-100 transition-opacity">
                      🖱️
                    </span>
                  )}
                </p>
                <p className={`text-xs font-bold mt-0.5 ${s.hi || 'text-white'}`}>{s.value}</p>
              </div>
            ))}
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <p className="text-xs text-gray-400 uppercase tracking-widest">Top Companies</p>
              <button className="text-xs text-blue-400 hover:underline">View all →</button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {companies.slice(0,5).map((c,i) => (
                <span key={c} className={`text-xs font-medium px-2 py-1 rounded-md text-white ${
                  ['bg-blue-700','bg-blue-600','bg-red-700','bg-red-600','bg-red-500'][i] ?? 'bg-gray-700'
                }`}>{c.split(' ')[0]}</span>
              ))}
              <span className="text-xs text-gray-400 bg-white/10 px-2 py-1 rounded-md">+23 More</span>
            </div>
          </div>

          <div>
            <p className="text-xs text-gray-400 uppercase tracking-widest mb-2">Key Responsibilities</p>
            {loading ? (
              <span className="flex items-center gap-2 text-gray-500 py-1 text-xs">
                <span className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                Loading responsibilities...
              </span>
            ) : (
              <ul className="space-y-1.5">
                {details.responsibilities.map((r, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-gray-300">
                    <span className="text-emerald-400 shrink-0 mt-0.5">●</span>{r}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* AI Insight Card */}
          <div className="bg-gradient-to-r from-blue-950/40 to-indigo-950/40 border border-blue-500/20 rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-1.5 text-xs text-blue-400 font-semibold tracking-wide uppercase">
              <span className="text-sm">✦</span>
              <span>AI Insight · {role.title} · {insightMetric}</span>
            </div>
            <p className="text-xs text-gray-300 leading-relaxed min-h-[36px]">
              {insightLoading ? (
                <span className="flex items-center gap-2 text-gray-500 py-1">
                  <span className="w-3.5 h-3.5 border-2 border-white/20 border-t-blue-400 rounded-full animate-spin" />
                  Analyzing US market trends...
                </span>
              ) : (
                insight ? `"${insight}"` : "No insight available for the selected metric."
              )}
            </p>
          </div>

          <div className="bg-gradient-to-br from-blue-600/20 to-blue-800/10 border border-blue-500/20 rounded-xl p-4 text-center">
            <p className="text-sm font-semibold text-white mb-1">Ready to apply?</p>
            <p className="text-xs text-gray-400 mb-3">Find {role.title} jobs that match your profile.</p>
            <button className="w-full bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold py-2.5 rounded-lg transition-all hover:shadow-lg hover:shadow-blue-500/30">
              View Matching Jobs →
            </button>
          </div>
        </div>
      )}

      {tab === 'Market Data' && (
        <div className="p-4 space-y-2">
          <p className="text-xs text-gray-400 uppercase tracking-widest mb-3">Market Intelligence</p>
          {[
            ['Total US Jobs', role.jobs],
            ['Salary Min', role.salaryMin],
            ['Salary Max', role.salaryMax],
            ['Annual Growth', `+${role.growth}`],
            ['AI Exposure', `${role.aiExposure}/10`],
            ['Match Score', `${role.score.toFixed(1)}/10`],
            ['Demand Level', role.score >= 9 ? 'High' : 'Medium'],
            ['Remote Available', '65%'],
            ['Visa Sponsorship', '45%'],
          ].map(([k,v]) => (
            <div key={k} className="flex justify-between items-center py-2 border-b border-white/5 group">
              <span className="text-xs text-gray-400 group-hover:text-gray-300 transition-colors">{k}</span>
              <span className="text-xs font-semibold text-white">{v}</span>
            </div>
          ))}
        </div>
      )}

      {tab === 'Skills' && (
        <div className="p-4">
          <p className="text-xs text-gray-400 uppercase tracking-widest mb-3">Required Skills</p>
          <div className="flex flex-wrap gap-2">
            {skills.map(s => (
              <span key={s} className="text-xs bg-blue-600/20 border border-blue-500/30 text-blue-300 px-2.5 py-1 rounded-full">{s}</span>
            ))}
          </div>
        </div>
      )}
    </aside>
  )
}