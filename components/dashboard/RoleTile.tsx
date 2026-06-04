export interface RoleData {
  title: string; score: number; jobs: string
  salaryMin: string; salaryMax: string; growth: string
  aiExposure: number; colSpan?: number; rowSpan?: number
}

interface Props { role: RoleData; colorMode: string; selected: boolean; onClick: () => void }

function parseSalary(s: string): number {
  const n = parseInt(s.replace(/[^0-9]/g, ''))
  return isNaN(n) ? 0 : n
}

function getBg(mode: string, role: RoleData): string {
  let val = 0
  if (mode === 'match')  val = role.score
  else if (mode === 'growth') val = parseFloat(role.growth) || 0
  else if (mode === 'ai')     val = 10 - role.aiExposure        // invert: low AI = green
  else if (mode === 'salary') val = parseSalary(role.salaryMax) / 13
  else                        val = (parseInt(role.jobs.replace(/,/g,'')) || 0) / 2000

  if (mode === 'match') {
    if (val >= 9.0) return 'bg-gradient-to-br from-emerald-900/90 to-emerald-950/90 border-emerald-500/30 text-emerald-300' // Dark Green
    if (val >= 8.0) return 'bg-gradient-to-br from-green-800/80 to-green-900/80 border-green-500/20 text-green-300'       // Green
    if (val >= 7.0) return 'bg-gradient-to-br from-yellow-800/40 to-yellow-900/40 border-yellow-500/20 text-yellow-300'   // Yellow
    if (val >= 6.0) return 'bg-gradient-to-br from-orange-800/40 to-orange-950/40 border-orange-500/20 text-orange-300'   // Orange
    return 'bg-gradient-to-br from-red-950/60 to-red-950/90 border-red-500/20 text-red-400'                              // Red
  }

  if (val >= 8)  return 'bg-gradient-to-br from-emerald-700 to-emerald-900 border-emerald-500/30'
  if (val >= 6)  return 'bg-gradient-to-br from-green-700 to-green-900 border-green-500/30'
  if (val >= 4)  return 'bg-gradient-to-br from-yellow-700 to-yellow-900 border-yellow-500/30'
  if (val >= 2)  return 'bg-gradient-to-br from-orange-700 to-orange-900 border-orange-500/30'
  return 'bg-gradient-to-br from-red-800 to-red-950 border-red-500/30'
}

function getPrimaryValue(mode: string, role: RoleData): { value: string; unit: string } {
  switch (mode) {
    case 'match':   return { value: role.score.toFixed(1),              unit: '/10' }
    case 'salary':  return { value: role.salaryMin + '–' + role.salaryMax, unit: '' }
    case 'growth':  return { value: '+' + role.growth,                  unit: '' }
    case 'ai':      return { value: role.aiExposure.toFixed(1),         unit: '/10' }
    case 'volume':  return { value: role.jobs,                          unit: ' jobs' }
    default:        return { value: role.score.toFixed(1),              unit: '/10' }
  }
}

function getSecondaryLine(mode: string, role: RoleData): string {
  switch (mode) {
    case 'match':   return role.jobs + ' jobs · ' + role.salaryMin + '–' + role.salaryMax
    case 'salary':  return role.jobs + ' jobs · +' + role.growth + ' growth'
    case 'growth':  return role.salaryMin + '–' + role.salaryMax + ' · ' + role.jobs + ' jobs'
    case 'ai':      return role.salaryMin + '–' + role.salaryMax + ' · match ' + role.score.toFixed(1)
    case 'volume':  return role.salaryMin + '–' + role.salaryMax + ' · +' + role.growth
    default:        return ''
  }
}

export function RoleTile({ role, colorMode, selected, onClick }: Props) {
  const bg = getBg(colorMode, role)
  const isLarge = (role.colSpan ?? 1) >= 2 && (role.rowSpan ?? 1) >= 2
  const isMed   = (role.colSpan ?? 1) >= 2
  const primary = getPrimaryValue(colorMode, role)
  const secondary = getSecondaryLine(colorMode, role)

  return (
    <div onClick={onClick}
      style={{ gridColumn: `span ${role.colSpan ?? 1}`, gridRow: `span ${role.rowSpan ?? 1}` }}
      className={`${bg} rounded-xl p-3 cursor-pointer transition-all duration-200 border
        hover:brightness-125 hover:scale-[1.01] hover:shadow-xl
        ${selected ? 'ring-2 ring-white shadow-2xl brightness-110' : ''}`}>

      {isLarge ? (
        <div className="flex flex-col h-full justify-between">
          <div>
            <h3 className="font-bold text-white text-base leading-tight">{role.title}</h3>
            <p className="text-xl font-bold text-white mt-1">
              {primary.value}<span className="text-sm text-white/50">{primary.unit}</span>
            </p>
          </div>
          <div>
            <p className="text-white/60 text-[10px] mt-1">{secondary}</p>
            {colorMode === 'match' && (
              <span className="inline-block text-[10px] bg-white/20 text-white px-2 py-0.5 rounded-full mt-1.5">
                +{role.growth} Growth
              </span>
            )}
          </div>
        </div>
      ) : isMed ? (
        <div className="flex flex-col h-full justify-between gap-1">
          <div>
            <h3 className="font-semibold text-white text-xs leading-tight">{role.title}</h3>
            <p className="text-sm font-bold text-white mt-0.5">
              {primary.value}<span className="text-xs text-white/50">{primary.unit}</span>
            </p>
          </div>
          <p className="text-[10px] text-white/50 truncate">{secondary}</p>
        </div>
      ) : (
        <div className="flex flex-col h-full justify-between gap-1">
          <h3 className="font-semibold text-white text-[11px] leading-tight">{role.title}</h3>
          <div>
            <p className="text-xs font-bold text-white">
              {primary.value}<span className="text-xs text-white/40">{primary.unit}</span>
            </p>
            {colorMode === 'growth' && <p className="text-[10px] text-white/50">+{role.growth}</p>}
          </div>
        </div>
      )}
    </div>
  )
}