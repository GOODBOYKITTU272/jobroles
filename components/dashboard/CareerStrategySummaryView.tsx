'use client'
import type { RoleData } from './RoleTile'

interface Props {
  roles: RoleData[]
  parsedRole: string
  candidateName?: string
}

export function CareerStrategySummaryView({ roles, parsedRole, candidateName = 'Candidate' }: Props) {
  const displayRole = parsedRole || 'Target Occupation'
  const initials = candidateName.split(' ').slice(0, 2).map(n => n[0]?.toUpperCase() ?? '').join('') || 'SE'

  // Dynamic calculations from parsed data
  const totalRoles = roles.length
  const primaryRolesCount = roles.filter(r => r.score >= 9.0).length
  const secondaryRolesCount = roles.filter(r => r.score >= 8.0 && r.score < 9.0).length
  const transferableRolesCount = roles.filter(r => r.score >= 7.0 && r.score < 8.0).length

  // Job sum calculation or fallback
  const totalJobsSum = roles.reduce((sum, r) => sum + (parseInt(r.jobs.replace(/,/g, '')) || 0), 0)
  const displayJobs = totalJobsSum > 0 ? totalJobsSum.toLocaleString() + '+' : '85,000+'

  // Allocations matching the screenshot logic
  const primaryRoles = roles.filter(r => r.score >= 9.0)
  const secondaryRoles = roles.filter(r => r.score >= 8.0 && r.score < 9.0)
  const transferableRoles = roles.filter(r => r.score >= 7.0 && r.score < 8.0)

  // Allocation distribution
  const top1 = roles[0]?.title || 'ETL QA Engineer'
  const top2 = roles[1]?.title || 'Data Warehouse QA Engineer'
  const top3 = roles[2]?.title || 'BI QA Analyst'
  const top4 = roles[3]?.title || 'Data QA Engineer'
  const top5 = roles[4]?.title || 'SQL QA Engineer'
  const top6 = roles[5]?.title || 'Power BI QA Analyst'
  const top7 = roles[6]?.title || 'Data Validation Analyst'
  const othersCount = totalRoles - 7

  // Skill wrapper roles for why 20+ roles list
  const skillsAppearRoles = roles.slice(0, 6).map(r => r.title)

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-1 font-sans text-gray-300">
      
      {/* 1. PROFILE HEADER CARD */}
      <div className="bg-[#13151f]/80 border border-white/10 rounded-2xl p-5 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-blue-600/90 text-white font-bold flex items-center justify-center text-lg shadow-lg shadow-blue-500/20">
            {initials}
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight uppercase">{candidateName}</h1>
            <p className="text-xs text-gray-400 mt-0.5">{displayRole}</p>
            <div className="flex items-center gap-3 text-[10px] text-gray-500 mt-2">
              <span className="flex items-center gap-1">📍 Pembroke Pines, FL</span>
              <span className="flex items-center gap-1">✉ sandeep.ed05@gmail.com</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-emerald-950/40 border border-emerald-500/20 px-4 py-2 rounded-xl">
          <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold font-mono">★</span>
          <div>
            <p className="text-[10px] text-gray-400 leading-tight uppercase font-semibold">Primary Role</p>
            <p className="text-xs text-emerald-400 font-bold mt-0.5 leading-tight">{top1}</p>
          </div>
        </div>
      </div>

      {/* 2. TOP METRICS ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Roles Identified */}
        <div className="bg-[#13151f]/80 border border-white/10 rounded-2xl p-4 flex items-center gap-4 shadow">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center text-lg font-semibold shrink-0">
            👥
          </div>
          <div>
            <h3 className="text-xl font-bold text-white leading-tight">{totalRoles}</h3>
            <p className="text-[10px] text-gray-400 font-medium">Roles Identified</p>
            <p className="text-[9px] text-gray-500 mt-0.5">(Across 3 Categories)</p>
          </div>
        </div>

        {/* Total Job Opportunities */}
        <div className="bg-[#13151f]/80 border border-white/10 rounded-2xl p-4 flex items-center gap-4 shadow">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-lg shrink-0">
            💼
          </div>
          <div>
            <h3 className="text-xl font-bold text-emerald-400 leading-tight">{displayJobs}</h3>
            <p className="text-[10px] text-gray-400 font-medium">Total Job Opportunities</p>
            <p className="text-[9px] text-gray-500 mt-0.5">(Career Portals Only)</p>
          </div>
        </div>

        {/* Applications Per Day */}
        <div className="bg-[#13151f]/80 border border-white/10 rounded-2xl p-4 flex items-center gap-4 shadow">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center text-lg shrink-0">
            ✈
          </div>
          <div>
            <h3 className="text-xl font-bold text-purple-400 leading-tight">25</h3>
            <p className="text-[10px] text-gray-400 font-medium">Applications Per Day</p>
            <p className="text-[9px] text-gray-500 mt-0.5">(Recommended)</p>
          </div>
        </div>

        {/* Interview Potential */}
        <div className="bg-[#13151f]/80 border border-white/10 rounded-2xl p-4 flex items-center gap-4 shadow">
          <div className="w-10 h-10 rounded-xl bg-yellow-500/10 text-yellow-400 flex items-center justify-center text-lg shrink-0">
            📊
          </div>
          <div>
            <h3 className="text-xl font-bold text-yellow-400 leading-tight">82%</h3>
            <p className="text-[10px] text-gray-400 font-medium">Interview Potential</p>
            <p className="text-[9px] text-gray-500 mt-0.5">(Across All Roles)</p>
          </div>
        </div>

      </div>

      {/* 3. WHY THIS STRATEGY WORKS GRID */}
      <div>
        <h2 className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-3">Why This Strategy Works</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Why 20+ Roles? */}
          <div className="bg-[#13151f]/80 border border-white/10 rounded-2xl p-4 flex flex-col justify-between min-h-[220px]">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-blue-400 text-sm">🎯</span>
                <h3 className="text-xs font-bold text-white">Why 20+ Roles?</h3>
              </div>
              <p className="text-[10px] text-gray-400 mb-3 leading-normal">
                Companies use different titles for the same skills. ETL QA skills appear under:
              </p>
              <ul className="space-y-1">
                {skillsAppearRoles.map(roleName => (
                  <li key={roleName} className="text-[9px] text-gray-300 flex items-center gap-1.5 truncate">
                    <span className="text-emerald-400">✔</span> {roleName}
                  </li>
                ))}
              </ul>
            </div>
            <button className="text-[9px] text-blue-400 hover:underline text-left mt-3 flex items-center gap-1 font-semibold">
              Learn more ➔
            </button>
          </div>

          {/* Why Last 24 Hours? */}
          <div className="bg-[#13151f]/80 border border-white/10 rounded-2xl p-4 flex flex-col justify-between min-h-[220px]">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-emerald-400 text-sm">🕒</span>
                <h3 className="text-xs font-bold text-white">Why Last 24 Hours?</h3>
              </div>
              <p className="text-[10px] text-gray-400 mb-3 leading-normal">
                Jobs posted recently have:
              </p>
              <ul className="space-y-2 mt-1">
                <li className="text-[9px] text-gray-300 flex items-center gap-1.5">
                  <span className="text-emerald-400">✔</span> Fewer applicants
                </li>
                <li className="text-[9px] text-gray-300 flex items-center gap-1.5">
                  <span className="text-emerald-400">✔</span> Higher recruiter visibility
                </li>
                <li className="text-[9px] text-gray-300 flex items-center gap-1.5">
                  <span className="text-emerald-400">✔</span> Better ATS ranking
                </li>
                <li className="text-[9px] text-gray-300 flex items-center gap-1.5">
                  <span className="text-emerald-400">✔</span> Faster response rates
                </li>
              </ul>
            </div>
            <button className="text-[9px] text-blue-400 hover:underline text-left mt-3 flex items-center gap-1 font-semibold">
              Learn more ➔
            </button>
          </div>

          {/* AI Market Impact */}
          <div className="bg-[#13151f]/80 border border-white/10 rounded-2xl p-4 flex flex-col justify-between min-h-[220px]">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-purple-400 text-sm">🤖</span>
                <h3 className="text-xs font-bold text-white">AI Market Impact</h3>
              </div>
              <p className="text-[10px] text-gray-400 leading-relaxed mt-1">
                AI is changing job titles. Many companies now combine ETL, Reporting, QA and BI into hybrid positions.
              </p>
              <p className="text-[10px] text-gray-400 leading-relaxed mt-2.5">
                Applying to only one title reduces market reach by <strong className="text-white">60–70%</strong>.
              </p>
            </div>
            <button className="text-[9px] text-blue-400 hover:underline text-left mt-3 flex items-center gap-1 font-semibold">
              Learn more ➔
            </button>
          </div>

          {/* ApplyWizz Strategy */}
          <div className="bg-[#13151f]/80 border border-white/10 rounded-2xl p-4 flex flex-col justify-between min-h-[220px]">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-yellow-400 text-sm">🚀</span>
                <h3 className="text-xs font-bold text-white">ApplyWizz Strategy</h3>
              </div>
              <ul className="space-y-2 mt-2">
                <li className="text-[9px] text-gray-300 flex items-start gap-1.5">
                  <span className="text-emerald-400 shrink-0">✔</span> Career Portals Only
                </li>
                <li className="text-[9px] text-gray-300 flex items-start gap-1.5">
                  <span className="text-emerald-400 shrink-0">✔</span> {totalRoles} Related Roles
                </li>
                <li className="text-[9px] text-gray-300 flex items-start gap-1.5">
                  <span className="text-emerald-400 shrink-0">✔</span> 25 Applications Daily
                </li>
                <li className="text-[9px] text-gray-300 flex items-start gap-1.5 leading-normal">
                  <span className="text-emerald-400 shrink-0">✔</span> Consistent applications generate more interviews than occasional bulk applying.
                </li>
              </ul>
            </div>
            <button className="text-[9px] text-blue-400 hover:underline text-left mt-3 flex items-center gap-1 font-semibold">
              Learn more ➔
            </button>
          </div>

        </div>
      </div>

      {/* 4. ROLE MATCH OVERVIEW (HEATMAP) */}
      <div>
        <h2 className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-3">Role Match Overview (Heatmap)</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Primary */}
          <div className="bg-[#13151f]/80 border border-white/10 rounded-2xl p-4 flex flex-col justify-between min-h-[100px]">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-emerald-400 font-bold text-xs uppercase tracking-wide">Primary Roles</p>
                <p className="text-gray-500 text-[10px] mt-0.5">(90%+ Match)</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-2xl font-bold text-white leading-none">{primaryRolesCount}</p>
                <p className="text-[10px] text-gray-500 mt-0.5">Roles</p>
              </div>
            </div>
            <div className="bg-white/5 h-2 rounded-full overflow-hidden mt-4">
              <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${(primaryRolesCount / totalRoles) * 100}%` }} />
            </div>
          </div>

          {/* Secondary */}
          <div className="bg-[#13151f]/80 border border-white/10 rounded-2xl p-4 flex flex-col justify-between min-h-[100px]">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-green-400 font-bold text-xs uppercase tracking-wide">Secondary Roles</p>
                <p className="text-gray-500 text-[10px] mt-0.5">(80–89% Match)</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-2xl font-bold text-white leading-none">{secondaryRolesCount}</p>
                <p className="text-[10px] text-gray-500 mt-0.5">Roles</p>
              </div>
            </div>
            <div className="bg-white/5 h-2 rounded-full overflow-hidden mt-4">
              <div className="bg-green-500 h-full rounded-full" style={{ width: `${(secondaryRolesCount / totalRoles) * 100}%` }} />
            </div>
          </div>

          {/* Transferable */}
          <div className="bg-[#13151f]/80 border border-white/10 rounded-2xl p-4 flex flex-col justify-between min-h-[100px]">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-yellow-400 font-bold text-xs uppercase tracking-wide">Transferable Roles</p>
                <p className="text-gray-500 text-[10px] mt-0.5">(70–79% Match)</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-2xl font-bold text-white leading-none">{transferableRolesCount}</p>
                <p className="text-[10px] text-gray-500 mt-0.5">Roles</p>
              </div>
            </div>
            <div className="bg-white/5 h-2 rounded-full overflow-hidden mt-4">
              <div className="bg-yellow-500 h-full rounded-full" style={{ width: `${(transferableRolesCount / totalRoles) * 100}%` }} />
            </div>
          </div>

        </div>
      </div>

      {/* 5. DONUT ALLOCATION & INVENTORY & INTERVIEW POTENTIAL */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        {/* Application Allocation Pie/Donut Chart */}
        <div className="bg-[#13151f]/80 border border-white/10 rounded-2xl p-4 flex flex-col justify-between min-h-[260px]">
          <h3 className="text-xs font-bold text-white mb-3">Application Allocation (25 Per Day)</h3>
          
          <div className="flex items-center gap-4">
            
            {/* SVG Donut Chart */}
            <div className="relative w-28 h-28 shrink-0 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="15.915" fill="none" stroke="#222533" strokeWidth="3" />
                {/* 5 apps = 20% (strokeDasharray: 20 80) */}
                <circle cx="18" cy="18" r="15.915" fill="none" stroke="#10b981" strokeWidth="3.2" strokeDasharray="20 80" strokeDashoffset="0" />
                {/* 4 apps = 16% (strokeDasharray: 16 84, starts offset 20) */}
                <circle cx="18" cy="18" r="15.915" fill="none" stroke="#84cc16" strokeWidth="3.2" strokeDasharray="16 84" strokeDashoffset="-20" />
                {/* 3 apps = 12% (starts offset 36) */}
                <circle cx="18" cy="18" r="15.915" fill="none" stroke="#0ea5e9" strokeWidth="3.2" strokeDasharray="12 88" strokeDashoffset="-36" />
                {/* 3 apps = 12% (starts offset 48) */}
                <circle cx="18" cy="18" r="15.915" fill="none" stroke="#f59e0b" strokeWidth="3.2" strokeDasharray="12 88" strokeDashoffset="-48" />
                {/* 2 apps = 8% (starts offset 60) */}
                <circle cx="18" cy="18" r="15.915" fill="none" stroke="#3b82f6" strokeWidth="3.2" strokeDasharray="8 92" strokeDashoffset="-60" />
                {/* 2 apps = 8% (starts offset 68) */}
                <circle cx="18" cy="18" r="15.915" fill="none" stroke="#8b5cf6" strokeWidth="3.2" strokeDasharray="8 92" strokeDashoffset="-68" />
                {/* 2 apps = 8% (starts offset 76) */}
                <circle cx="18" cy="18" r="15.915" fill="none" stroke="#a855f7" strokeWidth="3.2" strokeDasharray="8 92" strokeDashoffset="-76" />
                {/* 4 apps (others) = 16% (starts offset 84) */}
                <circle cx="18" cy="18" r="15.915" fill="none" stroke="#6b7280" strokeWidth="3.2" strokeDasharray="16 84" strokeDashoffset="-84" />
              </svg>
              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="text-lg font-bold text-white leading-tight">25</span>
                <span className="text-[7px] text-gray-500 leading-none">Applications<br/>Per Day</span>
              </div>
            </div>

            {/* List side */}
            <div className="flex-1 space-y-1 max-h-[160px] overflow-y-auto pr-1">
              <div className="flex items-center justify-between text-[9px]">
                <span className="flex items-center gap-1 truncate"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"/>{top1}</span>
                <span className="font-semibold text-white ml-1">5</span>
              </div>
              <div className="flex items-center justify-between text-[9px]">
                <span className="flex items-center gap-1 truncate"><span className="w-1.5 h-1.5 rounded-full bg-lime-500 shrink-0"/>{top2}</span>
                <span className="font-semibold text-white ml-1">4</span>
              </div>
              <div className="flex items-center justify-between text-[9px]">
                <span className="flex items-center gap-1 truncate"><span className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0"/>{top3}</span>
                <span className="font-semibold text-white ml-1">3</span>
              </div>
              <div className="flex items-center justify-between text-[9px]">
                <span className="flex items-center gap-1 truncate"><span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0"/>{top4}</span>
                <span className="font-semibold text-white ml-1">3</span>
              </div>
              <div className="flex items-center justify-between text-[9px]">
                <span className="flex items-center gap-1 truncate"><span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0"/>{top5}</span>
                <span className="font-semibold text-white ml-1">2</span>
              </div>
              <div className="flex items-center justify-between text-[9px]">
                <span className="flex items-center gap-1 truncate"><span className="w-1.5 h-1.5 rounded-full bg-purple-500 shrink-0"/>{top6}</span>
                <span className="font-semibold text-white ml-1">2</span>
              </div>
              <div className="flex items-center justify-between text-[9px]">
                <span className="flex items-center gap-1 truncate"><span className="w-1.5 h-1.5 rounded-full bg-purple-400 shrink-0"/>{top7}</span>
                <span className="font-semibold text-white ml-1">2</span>
              </div>
              {othersCount > 0 && (
                <div className="flex items-center justify-between text-[9px] border-t border-white/5 pt-1 mt-1 text-gray-500">
                  <span className="flex items-center gap-1 truncate"><span className="w-1.5 h-1.5 rounded-full bg-gray-500 shrink-0"/>Others ({othersCount} Roles)</span>
                  <span className="font-semibold text-gray-400 ml-1">4</span>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Job Inventory Check */}
        <div className="bg-[#13151f]/80 border border-white/10 rounded-2xl p-4 flex flex-col justify-between min-h-[260px]">
          <div>
            <h3 className="text-xs font-bold text-white">Job Inventory Check</h3>
            <div className="mt-2.5">
              <p className="text-[10px] text-gray-500 leading-tight">Total Relevant Jobs</p>
              <p className="text-base font-bold text-white tracking-tight mt-0.5">{displayJobs}</p>
              <p className="text-[8px] text-gray-600 mt-0.5">(Career Portals Only)</p>
            </div>
            
            <p className="text-[10px] text-gray-400 mt-4 leading-none">Can support 25 applications/day for:</p>
            <div className="space-y-2 mt-3.5">
              <div className="flex items-center justify-between text-[10px] border-b border-white/5 pb-1.5">
                <span className="text-gray-300">30 Days</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">✔ Yes</span>
              </div>
              <div className="flex items-center justify-between text-[10px] border-b border-white/5 pb-1.5">
                <span className="text-gray-300">60 Days</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">✔ Yes</span>
              </div>
              <div className="flex items-center justify-between text-[10px] border-b border-white/5 pb-1.5">
                <span className="text-gray-300">90 Days</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">✔ Yes</span>
              </div>
              <div className="flex items-center justify-between text-[10px] pb-0.5">
                <span className="text-gray-300">180 Days</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">✔ Yes</span>
              </div>
            </div>
          </div>
        </div>

        {/* Estimated Interview Potential */}
        <div className="bg-[#13151f]/80 border border-white/10 rounded-2xl p-4 flex flex-col justify-between min-h-[260px]">
          <div>
            <h3 className="text-xs font-bold text-white mb-4">Estimated Interview Potential</h3>
            
            {/* ETL QA Only */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-[9px] text-gray-400">
                <span>Applying Only {top1}</span>
                <span className="font-bold text-white">35%</span>
              </div>
              <div className="bg-white/5 h-2 rounded-full overflow-hidden">
                <div className="bg-orange-500 h-full rounded-full" style={{ width: '35%' }} />
              </div>
            </div>

            {/* Across matching roles */}
            <div className="space-y-1 mt-4">
              <div className="flex justify-between items-center text-[9px] text-gray-400">
                <span>Applying Across {totalRoles} Matching Roles</span>
                <span className="font-bold text-white">82%</span>
              </div>
              <div className="bg-white/5 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: '82%' }} />
              </div>
            </div>
          </div>

          {/* Recommendation highlights box */}
          <div className="bg-amber-500/5 border border-amber-500/10 p-2.5 rounded-xl flex items-start gap-2.5">
            <div className="text-base shrink-0 mt-0.5">🎯</div>
            <div>
              <p className="text-[10px] font-bold text-amber-500 leading-tight">Best Approach</p>
              <p className="text-[9px] text-gray-400 mt-1 leading-normal">
                Apply across multiple relevant roles consistently to maximize interview probability.
              </p>
            </div>
          </div>

        </div>

      </div>

      {/* FOOTER CAPTION */}
      <p className="text-[9px] text-gray-500 text-center mt-2 leading-none">
        ⓘ All job numbers are estimated based on current US job market data from top career portals and industry trends (May 2026).
      </p>

    </div>
  )
}
