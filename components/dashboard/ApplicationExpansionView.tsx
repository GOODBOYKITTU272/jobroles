'use client'
import type { RoleData } from './RoleTile'

interface Props { roles: RoleData[] }

export function ApplicationExpansionView({ roles }: Props) {
  // 1. Sort roles by score descending
  const sortedRoles = [...roles].sort((a, b) => b.score - a.score)

  // 2. Classify roles based on Match Score range
  const getMatchDetails = (score: number) => {
    if (score >= 9.0) return { color: '🟢', label: 'Dark Green', priority: 'Very High', potential: 'Very High', badge: 'bg-emerald-950/80 text-emerald-300 border-emerald-500/20' }
    if (score >= 8.0) return { color: '🟩', label: 'Green', priority: 'High', potential: 'High', badge: 'bg-green-950/80 text-green-300 border-green-500/20' }
    if (score >= 7.0) return { color: '🟨', label: 'Yellow', priority: 'Medium', potential: 'Medium', badge: 'bg-yellow-950/40 text-yellow-300 border-yellow-500/20' }
    if (score >= 6.0) return { color: '🟧', label: 'Orange', priority: 'Low', potential: 'Low', badge: 'bg-orange-950/40 text-orange-300 border-orange-500/20' }
    return { color: '🟥', label: 'Red', priority: 'Do Not Prioritize', potential: 'Low', badge: 'bg-red-950/60 text-red-400 border-red-500/20' }
  }

  // 3. Application allocation helper (distributes exactly 25 applications proportionally)
  const calculateAllocation = () => {
    const allocation: Record<string, number> = {}
    let total = 0
    const limit = 25

    if (sortedRoles.length === 0) return allocation

    // Pass 1: Give based on score thresholds
    for (const r of sortedRoles) {
      if (total >= limit) break
      let amt = r.score >= 9.0 ? 5 : r.score >= 8.0 ? 3 : r.score >= 7.0 ? 2 : 1
      amt = Math.min(amt, limit - total)
      allocation[r.title] = amt
      total += amt
    }

    // Pass 2: If we haven't reached 25, distribute remaining to top roles
    let i = 0
    while (total < limit) {
      const r = sortedRoles[i % sortedRoles.length]
      allocation[r.title] = (allocation[r.title] || 0) + 1
      total++
      i++
    }
    return allocation
  }

  const allocation = calculateAllocation()

  // 4. Job Inventory estimates
  const totalJobs = roles.reduce((sum, r) => sum + (parseInt(r.jobs.replace(/,/g, '')) || 0), 0)

  // 5. Highlights Extraction
  const bestRole = sortedRoles[0]
  const highestDemandRole = [...roles].sort((a,b) => (parseInt(b.jobs.replace(/,/g, '')) || 0) - (parseInt(a.jobs.replace(/,/g, '')) || 0))[0]
  const fastestGrowingRole = [...roles].sort((a,b) => parseFloat(b.growth) - parseFloat(a.growth))[0]

  // Fallbacks for missing explainers in pre-existing reports
  const getWhyItMatchesFallback = (title: string, score: number) => {
    if (score >= 9.0) return `Highly aligned with parsed resume. Matches 95%+ of employer requirements.`
    if (score >= 8.0) return `Strong match. High overlap with key tools, technologies, and skills.`
    if (score >= 7.0) return `Good fit. Core skills are highly transferable with minor upskilling required.`
    return `Potential stretch role. Useful to explore for career transition options.`
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Application Expansion Engine</h1>
        <p className="text-xs text-gray-500 mt-1 max-w-3xl">
          Optimized job strategy report mapping 20-30 roles from your parsed profile. Focuses on matching primary, adjacent, and stretch roles to sustain daily applications.
        </p>
      </div>

      {/* Highlights Row */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <p className="text-[10px] text-gray-500 uppercase font-semibold">Best Match Role</p>
          <p className="text-base font-bold text-white mt-1 truncate">{bestRole?.title || 'N/A'}</p>
          <p className="text-xs text-emerald-400 font-medium mt-0.5">{bestRole ? `${bestRole.score.toFixed(1)}/10 Score` : ''}</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <p className="text-[10px] text-gray-500 uppercase font-semibold">Highest Demand Role</p>
          <p className="text-base font-bold text-white mt-1 truncate">{highestDemandRole?.title || 'N/A'}</p>
          <p className="text-xs text-blue-400 font-medium mt-0.5">{highestDemandRole?.jobs || 0} Openings</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <p className="text-[10px] text-gray-500 uppercase font-semibold">Fastest Growing Role</p>
          <p className="text-base font-bold text-white mt-1 truncate">{fastestGrowingRole?.title || 'N/A'}</p>
          <p className="text-xs text-emerald-400 font-medium mt-0.5">+{fastestGrowingRole?.growth || '0%'}</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 font-sans">
          <p className="text-[10px] text-gray-500 uppercase font-semibold">Total Reachable Jobs</p>
          <p className="text-base font-bold text-white mt-1">{totalJobs.toLocaleString()}</p>
          <p className="text-xs text-gray-400 mt-0.5">Across all roles</p>
        </div>
      </div>

      {/* Allocation & Inventory Section */}
      <div className="grid grid-cols-12 gap-5">
        {/* Allocation */}
        <div className="col-span-7 bg-[#13151f]/80 border border-white/10 rounded-xl p-5">
          <h2 className="text-sm font-bold text-white mb-1">Daily Application Allocation (25 Apps/Day)</h2>
          <p className="text-xs text-gray-500 mb-4">Recommended application distribution across target roles to optimize interview pipeline.</p>
          <div className="space-y-2.5 max-h-[280px] overflow-y-auto pr-2">
            {sortedRoles.map(r => {
              const count = allocation[r.title] || 0
              if (count === 0) return null
              const details = getMatchDetails(r.score)
              const widthPercent = (count / 5) * 100
              return (
                <div key={r.title} className="flex items-center gap-4 bg-white/5 p-2 rounded-lg border border-white/5">
                  <span className="text-xs text-white font-medium w-36 truncate">{r.title}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded border font-semibold shrink-0 uppercase w-20 text-center bg-white/10 text-white/80 border-white/10">
                    {count} {count === 1 ? 'App' : 'Apps'}
                  </span>
                  <div className="flex-1 bg-white/5 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-blue-500 h-full rounded-full" style={{ width: `${widthPercent}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Job Sustainability Inventory */}
        <div className="col-span-5 bg-[#13151f]/80 border border-white/10 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-white mb-1">Job Inventory Check</h2>
            <p className="text-xs text-gray-500 mb-4">Verification that reachable inventory ({totalJobs.toLocaleString()} jobs) supports 25 apps/day.</p>
            
            <div className="space-y-2.5">
              {[
                { days: 30, req: 750 },
                { days: 60, req: 1500 },
                { days: 90, req: 2250 },
                { days: 180, req: 4500 }
              ].map(item => {
                const isSupported = totalJobs >= item.req
                return (
                  <div key={item.days} className="flex items-center justify-between p-3.5 rounded-xl bg-[#181a26]/50 border border-white/5 shadow-md">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-white">{item.days} Days Strategy</span>
                      <span className="text-[10px] text-gray-500">({item.req} jobs req.)</span>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold border ${
                      isSupported 
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                        : 'bg-red-500/10 text-red-400 border-red-500/20'
                    }`}>
                      {isSupported ? 'Fully Supported ✔' : 'Unsupported ✕'}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
          
          <div className="bg-blue-950/20 border border-blue-500/10 p-3.5 rounded-xl flex items-start gap-2.5 mt-4">
            <span className="text-sm shrink-0">💡</span>
            <p className="text-[11px] text-gray-400 leading-normal">
              <strong className="text-white">Recruiter Tip:</strong> Spreading daily submissions across 3-5 roles prevents pipeline saturation and ensures a continuous flow of screening requests.
            </p>
          </div>
        </div>
      </div>

      {/* Master Output Table */}
      <div className="bg-[#13151f]/80 border border-white/10 rounded-xl p-5 overflow-hidden">
        <h2 className="text-sm font-bold text-white mb-4">Master Application Expansion Mapping</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-[10px] text-gray-500 uppercase tracking-widest bg-white/5">
                <th className="py-2.5 px-4 font-semibold">Rank</th>
                <th className="py-2.5 px-4 font-semibold">Role Name</th>
                <th className="py-2.5 px-4 font-semibold">Match Score</th>
                <th className="py-2.5 px-4 font-semibold">Color Rating</th>
                <th className="py-2.5 px-4 font-semibold">Interview Potential</th>
                <th className="py-2.5 px-4 font-semibold">Application Priority</th>
                <th className="py-2.5 px-4 font-semibold">Market Demand</th>
                <th className="py-2.5 px-4 font-semibold">Transition Alignment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-xs">
              {sortedRoles.map((r, idx) => {
                const details = getMatchDetails(r.score)
                const rMeta = (r as any).why_it_matches || getWhyItMatchesFallback(r.title, r.score)
                const potential = (r as any).interview_potential || details.potential
                return (
                  <tr key={r.title} className="hover:bg-white/5 transition-colors group">
                    <td className="py-3.5 px-4 text-gray-500 font-semibold">{idx + 1}</td>
                    <td className="py-3.5 px-4 font-bold text-white group-hover:text-blue-400 transition-colors">{r.title}</td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold">{r.score.toFixed(1)}</span>
                      <span className="text-gray-500 text-[10px] ml-1">({Math.round(r.score * 10)}%)</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-sm mr-1.5">{details.color}</span>
                      <span className="text-xs text-gray-400">{details.label}</span>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-white/80">{potential}</td>
                    <td className="py-3.5 px-4">
                      <span className={`text-[10px] px-2 py-0.5 rounded font-bold border uppercase tracking-wider ${
                        details.priority === 'Very High' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/20' :
                        details.priority === 'High' ? 'bg-green-500/20 text-green-400 border-green-500/20' :
                        details.priority === 'Medium' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/20' :
                        'bg-orange-500/20 text-orange-400 border-orange-500/20'
                      }`}>
                        {details.priority}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-gray-400 font-semibold">{r.jobs} open jobs</td>
                    <td className="py-3.5 px-4 text-gray-400 max-w-sm leading-relaxed truncate group-hover:whitespace-normal group-hover:text-gray-200 transition-all">
                      {rMeta}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Allocation Categories Summaries */}
      <div className="grid grid-cols-3 gap-5">
        {/* Primary target */}
        <div className="bg-[#13151f]/80 border border-white/10 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
            <h3 className="text-xs text-gray-400 font-bold uppercase tracking-wide">Primary Target Roles</h3>
          </div>
          <ul className="space-y-2.5">
            {sortedRoles.filter(r => r.score >= 8.0).slice(0, 10).map((r, i) => (
              <li key={r.title} className="flex justify-between items-center text-xs">
                <span className="text-white/80 font-medium">{i + 1}. {r.title}</span>
                <span className="text-emerald-400 font-bold">{r.score.toFixed(1)}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Adjacent */}
        <div className="bg-[#13151f]/80 border border-white/10 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
            <h3 className="text-xs text-gray-400 font-bold uppercase tracking-wide">Adjacent Roles</h3>
          </div>
          <ul className="space-y-2.5">
            {sortedRoles.filter(r => r.score >= 7.0 && r.score < 8.0).slice(0, 10).map((r, i) => (
              <li key={r.title} className="flex justify-between items-center text-xs">
                <span className="text-white/80 font-medium">{i + 1}. {r.title}</span>
                <span className="text-amber-500 font-bold">{r.score.toFixed(1)}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Stretch */}
        <div className="bg-[#13151f]/80 border border-white/10 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-2 h-2 rounded-full bg-orange-500 shrink-0" />
            <h3 className="text-xs text-gray-400 font-bold uppercase tracking-wide">Stretch Roles (Top 5)</h3>
          </div>
          <ul className="space-y-2.5">
            {sortedRoles.filter(r => r.score < 7.0).slice(0, 5).map((r, i) => (
              <li key={r.title} className="flex justify-between items-center text-xs">
                <span className="text-white/80 font-medium">{i + 1}. {r.title}</span>
                <span className="text-orange-400 font-bold">{r.score.toFixed(1)}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
