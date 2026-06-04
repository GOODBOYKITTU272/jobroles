'use client'
import { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

const STEPS = [
  { label: 'Resume uploaded',              duration: 1 },
  { label: 'Extracting text from resume',  duration: 3 },
  { label: 'AI career counselor analyzing',duration: 8 },
  { label: 'Matching against role library',duration: 3 },
  { label: 'Enriching with market data',   duration: 2 },
  { label: 'Building your Career GPS',     duration: 1 },
]

export default function ProcessingPage({ params }: { params: Promise<{ reportId: string }> }) {
  const { reportId } = use(params)
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    // Step animation based on cumulative durations
    let cumulative = 0
    const timers: ReturnType<typeof setTimeout>[] = []
    STEPS.forEach((s, i) => {
      const t = setTimeout(() => setStep(i), cumulative * 1000)
      timers.push(t)
      cumulative += s.duration
    })

    // Elapsed timer
    const ticker = setInterval(() => setElapsed(e => e + 1), 1000)

    // Poll for completion
    const poll = setInterval(async () => {
      const res = await fetch('/api/report-status/' + reportId)
      const data = await res.json() as { status: string }
      if (data.status === 'generated') {
        clearInterval(poll); clearInterval(ticker); timers.forEach(clearTimeout)
        router.push('/dashboard/' + reportId)
      }
      if (data.status === 'failed') {
        clearInterval(poll); clearInterval(ticker); timers.forEach(clearTimeout)
        router.push('/upload?error=failed')
      }
    }, 3000)

    return () => { clearInterval(poll); clearInterval(ticker); timers.forEach(clearTimeout) }
  }, [reportId, router])

  const mins = Math.floor(elapsed / 60)
  const secs = elapsed % 60
  const timeStr = mins > 0 ? `${mins}m ${secs}s` : `${secs}s`
  const totalExpected = STEPS.reduce((a, s) => a + s.duration, 0)
  const progress = Math.min((elapsed / totalExpected) * 100, 95)

  return (
    <main className="min-h-screen bg-[#0d0f1a] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center gap-2 justify-center mb-8">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center font-bold text-white">A</div>
          <span className="text-white font-bold text-xl">ApplyWizz</span>
        </div>

        <div className="bg-[#13151f] border border-white/10 rounded-2xl p-8 shadow-2xl">
          {/* Spinner + timer */}
          <div className="flex flex-col items-center mb-6">
            <div className="relative w-16 h-16 mb-4">
              <div className="absolute inset-0 rounded-full border-4 border-white/10" />
              <div className="absolute inset-0 rounded-full border-4 border-t-blue-500 animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-mono text-blue-400">{timeStr}</span>
              </div>
            </div>
            <h1 className="text-xl font-bold text-white">Analyzing your resume...</h1>
            <p className="text-gray-500 text-sm mt-1">AI career counselor is working</p>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-white/10 rounded-full h-1.5 mb-6">
            <div
              className="bg-blue-500 h-1.5 rounded-full transition-all duration-1000"
              style={{ width: progress + '%' }}
            />
          </div>

          {/* Steps */}
          <div className="space-y-3">
            {STEPS.map((s, i) => (
              <div key={s.label} className="flex items-center gap-3">
                <div className={'w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-xs ' +
                  (i < step ? 'bg-emerald-500 text-white' :
                   i === step ? 'bg-blue-500 text-white animate-pulse' :
                   'bg-white/10 text-gray-600')}>
                  {i < step ? '✓' : i === step ? '●' : '○'}
                </div>
                <span className={'text-sm ' +
                  (i < step ? 'text-gray-400 line-through' :
                   i === step ? 'text-white font-medium' :
                   'text-gray-600')}>
                  {s.label}
                </span>
                {i === step && (
                  <span className="ml-auto text-xs text-blue-400 animate-pulse">Running...</span>
                )}
                {i < step && (
                  <span className="ml-auto text-xs text-emerald-500">Done</span>
                )}
              </div>
            ))}
          </div>

          <p className="text-center text-gray-600 text-xs mt-6">
            Typical time: 15–30 seconds · Do not close this tab
          </p>
        </div>
      </div>
    </main>
  )
}