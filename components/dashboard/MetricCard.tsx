interface MetricCardProps {
  label: string
  value: string
  sub: string
  icon: string
}
export function MetricCard({ label, value, sub, icon }: MetricCardProps) {
  return (
    <div className="flex items-start gap-3 px-4 py-3 border-r border-white/10 last:border-0">
      <span className="text-xl mt-0.5">{icon}</span>
      <div>
        <p className="text-xs text-gray-400 uppercase tracking-wide">{label}</p>
        <p className="text-lg font-bold text-white leading-tight">{value}</p>
        <p className="text-xs text-gray-500">{sub}</p>
      </div>
    </div>
  )
}