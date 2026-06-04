'use client'
import type { RoleData } from './RoleTile'

interface Props {
  roles: RoleData[]
  selected: RoleData | null
  onSelect: (r: RoleData) => void
  parsedRole?: string
  topScore?: number
}

function scoreColor(s: number) {
  if (s >= 9) return 'text-emerald-400'
  if (s >= 7) return 'text-green-400'
  if (s >= 5) return 'text-yellow-400'
  return 'text-orange-400'
}

function initials(role: string): string {
  return role.split(' ').slice(0, 2).map(w => w[0]?.toUpperCase() ?? '').join('') || 'AI'
}

export function Sidebar({ roles, selected, onSelect, parsedRole = '', topScore = 0 }: Props) {
  const displayRole = parsedRole || 'Your Profile'
  const ini = initials(parsedRole)

  return (
    <aside className="w-52 shrink-0 bg-[#13151f] border-r border-white/10 flex flex-col h-screen sticky top-0 overflow-y-auto">

      {/* Profile card */}
      <div className="p-4 border-b border-white/10">
        <p className="text-xs text-gray-500 uppercase tracking-widest mb-3">Your Profile</p>
        <div className="flex items-start gap-2 mb-3">
          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center font-bold text-sm shrink-0">
            {ini}
          </div>
          <div className="min-w-0">
            <p className="text-xs text-gray-300 leading-snug break-words">{displayRole}</p>
            <span className="text-xs bg-emerald-500 text-black px-1.5 py-0.5 rounded font-semibold mt-1 inline-block">
              Top Match
            </span>
          </div>
        </div>
        <p className="text-xs text-gray-500">Match Confidence</p>
        <p className="text-2xl font-bold text-emerald-400">
          {topScore > 0 ? topScore.toFixed(1) : '–'}
          <span className="text-sm text-gray-500">/10</span>
        </p>
        <button className="mt-2 w-full text-xs bg-white/10 hover:bg-white/20 text-white rounded px-2 py-1.5 flex items-center justify-between transition-colors">
          View Profile Summary <span>›</span>
        </button>
      </div>

      {/* Role list */}
      <div className="p-3 flex-1">
        <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Related Role Family</p>
        <p className="text-xs text-gray-600 mb-3">{roles.length} related roles found</p>
        <div className="space-y-0.5">
          {roles.map((r) => (
            <button key={r.title} onClick={() => onSelect(r)}
              className={'w-full flex justify-between items-center px-2 py-1.5 rounded text-left transition-colors ' +
                (selected?.title === r.title ? 'bg-blue-600/30 text-white' : 'hover:bg-white/5 text-gray-400')}>
              <span className="text-xs truncate">{r.title}</span>
              <span className={'text-xs font-semibold ml-1 shrink-0 ' + scoreColor(r.score)}>
                {r.score.toFixed(1)}
              </span>
            </button>
          ))}
        </div>
        {roles.length > 0 && (
          <button className="mt-3 text-xs text-blue-400 hover:underline">View all related roles →</button>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-white/10">
        <p className="text-xs text-gray-600 font-semibold">DATA SOURCE</p>
        <p className="text-xs text-gray-600">Bureau of Labor Statistics</p>
        <p className="text-xs text-gray-600">Occupational Outlook Handbook</p>
        <p className="text-xs text-gray-600">Updated: May 2025</p>
        <button className="mt-1 text-xs text-blue-400 hover:underline">About This Data</button>
      </div>
    </aside>
  )
}