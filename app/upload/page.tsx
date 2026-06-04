'use client'
import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'

const ALLOWED_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]

export default function UploadPage() {
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  function handleFile(f: File | null) {
    setError(null)
    if (!f) return
    if (!ALLOWED_TYPES.includes(f.type)) { setError('Please upload a PDF or DOCX file'); return }
    if (f.size > 10 * 1024 * 1024) { setError('File must be under 10MB'); return }
    setFile(f)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!file) return
    setLoading(true)
    setElapsed(0)
    setError(null)
    timerRef.current = setInterval(() => setElapsed(e => e + 1), 1000)
    const fd = new FormData()
    fd.append('file', file)
    const res = await fetch('/api/analyze', { method: 'POST', body: fd })
    const data = await res.json() as { reportId?: string; error?: string }
    if (timerRef.current) clearInterval(timerRef.current)
    if (!res.ok) { setError(data.error ?? 'Something went wrong'); setLoading(false); return }
    router.push('/processing/' + data.reportId)
  }

  return (
    <main className="min-h-screen bg-[#0d0f1a] flex items-center justify-center px-4">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="flex items-center gap-2 justify-center mb-8">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center font-bold text-white">A</div>
          <span className="text-white font-bold text-xl">ApplyWizz</span>
          <span className="text-gray-500 text-sm">CAREER GPS</span>
        </div>

        <div className="bg-[#13151f] border border-white/10 rounded-2xl p-8 shadow-2xl">
          <h1 className="text-2xl font-bold text-white mb-1">Upload Your Resume</h1>
          <p className="text-gray-400 text-sm mb-6">
            Get your personalized Career Market Visualizer — see every role you can apply for.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Drop zone */}
            <div
              onClick={() => inputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0] ?? null) }}
              className={'border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all ' +
                (dragOver ? 'border-blue-400 bg-blue-500/10' : file ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-white/10 hover:border-blue-400/50 hover:bg-white/5')}>
              <input
                ref={inputRef}
                type="file"
                accept=".pdf,.docx"
                className="hidden"
                onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
              />
              {file ? (
                <div>
                  <p className="text-2xl mb-2">✅</p>
                  <p className="text-emerald-400 font-medium">{file.name}</p>
                  <p className="text-gray-500 text-xs mt-1">{(file.size / 1024).toFixed(0)} KB · Click to change</p>
                </div>
              ) : (
                <div>
                  <p className="text-4xl mb-3">📄</p>
                  <p className="text-white font-medium">Drop your resume here</p>
                  <p className="text-gray-400 text-sm mt-1">or click to browse</p>
                  <p className="text-gray-600 text-xs mt-2">PDF or DOCX · Max 10MB</p>
                </div>
              )}
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-red-400 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={!file || loading}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-xl transition-all shadow-lg shadow-blue-500/20 text-base">
              {loading ? (
                <span className="flex items-center justify-center gap-3">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Analyzing your resume...
                  <span className="font-mono text-blue-200 text-sm">{elapsed}s</span>
                </span>
              ) : 'Analyze My Resume →'}
            </button>
          </form>

          <p className="text-center text-gray-600 text-xs mt-4">
            AI-powered · Matches 340+ US job roles · Takes ~15 seconds
          </p>
        </div>
      </div>
    </main>
  )
}