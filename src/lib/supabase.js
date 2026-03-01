import { createClient } from '@supabase/supabase-js'

const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh3Y2dxeWJxb293ZnFsdWVlbnN6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIzMjY3MjcsImV4cCI6MjA4NzkwMjcyN30.Io0pWZJISA8R4-HS0MekW3iGbvmRLie8MibdPB4mwWI'

// Always route through a proxy to avoid ISP DNS issues.
// Dev: Vite dev server proxy (vite.config.js)
// Prod: Vercel edge rewrite (vercel.json)
const supabaseUrl = `${window.location.origin}/supabase-proxy`

export const supabase = createClient(supabaseUrl, SUPABASE_ANON_KEY)
