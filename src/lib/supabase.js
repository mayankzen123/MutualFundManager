import { createClient } from '@supabase/supabase-js'

const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh3Y2dxeWJxb293ZnFsdWVlbnN6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIzMjY3MjcsImV4cCI6MjA4NzkwMjcyN30.Io0pWZJISA8R4-HS0MekW3iGbvmRLie8MibdPB4mwWI'

// In dev, route through Vite proxy to bypass ISP DNS issues.
// In production, connect directly to Supabase.
const supabaseUrl =
  import.meta.env.DEV
    ? `${window.location.origin}/supabase-proxy`
    : 'https://xwcgqybqoowfqlueensz.supabase.co'

export const supabase = createClient(supabaseUrl, SUPABASE_ANON_KEY)
