import { NextRequest, NextResponse } from 'next/server'
import { serviceSupabase } from '@/lib/supabase/service'
import { extractText } from '@/lib/pipeline/extract'
import { parseResumeWithGPT } from '@/lib/pipeline/parse'
import { findTopMatchedRoles } from '@/lib/pipeline/match'

const DEMO_USER_ID = process.env.DEMO_USER_ID
const ALLOWED_MIME = new Set([
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
])

export async function POST(request: NextRequest) {
  if (!DEMO_USER_ID) return NextResponse.json({ error: 'DEMO_USER_ID not configured' }, { status: 500 })

  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    if (file.size > 10 * 1024 * 1024) return NextResponse.json({ error: 'File too large (max 10MB)' }, { status: 400 })
    if (!ALLOWED_MIME.has(file.type)) return NextResponse.json({ error: 'Please upload a PDF or DOCX file' }, { status: 400 })

    const fileType = file.type.includes('pdf') ? 'pdf' as const : 'docx' as const
    const buffer = Buffer.from(await file.arrayBuffer())

    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
    const storagePath = `${DEMO_USER_ID}/${Date.now()}-${safeName}`
    const { error: storageErr } = await serviceSupabase.storage
      .from('resumes').upload(storagePath, buffer, { contentType: file.type })
    if (storageErr) throw new Error(`Storage: ${storageErr.message}`)

    const fileUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/resumes/${storagePath}`

    const { data: resume, error: rErr } = await serviceSupabase
      .from('resumes')
      .insert({ user_id: DEMO_USER_ID, file_url: fileUrl, file_type: fileType, status: 'processing' })
      .select().single()
    if (rErr) throw new Error(`Resume row: ${rErr.message}`)

    const { data: report, error: repErr } = await serviceSupabase
      .from('career_reports')
      .insert({ user_id: DEMO_USER_ID, resume_id: resume.id, status: 'pending' })
      .select().single()
    if (repErr) throw new Error(`Report row: ${repErr.message}`)

    const rawText = await extractText(buffer, fileType)
    if (!rawText || rawText.trim().length < 50) {
      await serviceSupabase.from('resumes').update({ status: 'failed' }).eq('id', resume.id)
      await serviceSupabase.from('career_reports').update({ status: 'failed' }).eq('id', report.id)
      return NextResponse.json({ error: 'Could not extract text.' }, { status: 422 })
    }

    // AI career counselor analysis
    const parsed = await parseResumeWithGPT(rawText)
    console.log('[analyze] domain:', parsed.domain, '| role_matches count:', parsed.role_matches?.length ?? 0)

    await serviceSupabase.from('resumes').update({
      raw_text: rawText.slice(0, 50000),
      parsed_json: parsed,
      status: 'parsed',
    }).eq('id', resume.id)

    // Match roles + enrich with market data
    const matchedRoles = await findTopMatchedRoles(parsed)
    console.log('[analyze] matchedRoles count:', matchedRoles.length)

    if (matchedRoles.length > 0) {
      // Remove occupation_id from insert — column may be NOT NULL but we use role_title as key
      const rows = matchedRoles.map((r, i) => ({
        report_id:   report.id,
        role_title:  r.occupation_title,
        match_score: r.match_score,
        reason: JSON.stringify({
          salary_min:        r.salary_min,
          salary_max:        r.salary_max,
          growth_rate:       r.growth_rate,
          ai_exposure_score: r.ai_exposure_score,
          related_roles:     r.related_roles,
          employment_count:  r.employment_count,
        }),
        rank: i + 1,
      }))

      const { error: insertErr } = await serviceSupabase
        .from('recommended_roles')
        .insert(rows)

      if (insertErr) {
        console.error('[analyze] recommended_roles insert failed:', insertErr.message)
        // Try inserting one at a time to identify the bad row
        for (const row of rows) {
          const { error: e } = await serviceSupabase.from('recommended_roles').insert(row)
          if (e) console.error('[analyze] row failed:', row.role_title, e.message)
        }
      }
    }

    await serviceSupabase.from('career_reports').update({
      report_json: {
        parsed,
        domain:              parsed.domain,
        primary_role:        parsed.primary_role,
        ats_score:           parsed.ats_score,
        employability_score: parsed.employability_score,
      },
      status: 'generated',
    }).eq('id', report.id)

    return NextResponse.json({ reportId: report.id })

  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('[analyze] fatal:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}