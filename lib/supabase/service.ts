import { createClient } from '@supabase/supabase-js'

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) throw new Error('NEXT_PUBLIC_SUPABASE_URL is not set')
if (!process.env.SUPABASE_SERVICE_ROLE_KEY) throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set')

// Temp debug — remove after confirming keys load correctly
console.log('[supabase/service] KEY lengths:', {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL?.length,
  serviceRole: process.env.SUPABASE_SERVICE_ROLE_KEY?.length,
  anon: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.length,
})

export const serviceSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
)
