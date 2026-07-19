import { createClient } from '@supabase/supabase-js'
import ws from 'ws'

const supabaseUrl = process.env.SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY || 'placeholder-secret-key'

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SECRET_KEY) {
  console.warn('[supabase] Missing SUPABASE_URL or SUPABASE_SECRET_KEY — using placeholder client, DB-backed routes will fail until real credentials are set in .env')
}

export const supabase = createClient(supabaseUrl, supabaseSecretKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
  realtime: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    transport: ws as any,
  },
})
