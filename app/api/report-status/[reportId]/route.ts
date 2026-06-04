import { NextRequest, NextResponse } from 'next/server'
import { serviceSupabase } from '@/lib/supabase/service'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ reportId: string }> }) {
  const { reportId } = await params
  const { data, error } = await serviceSupabase
    .from('career_reports')
    .select('status')
    .eq('id', reportId)
    .single()

  if (error || !data) return NextResponse.json({ status: 'not_found' }, { status: 404 })
  return NextResponse.json({ status: data.status })
}