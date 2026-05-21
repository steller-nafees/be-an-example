import { createClient } from '@supabase/supabase-js'

// Publishable (anon) credentials — safe to ship in client code.
const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ?? 'https://xanccckavsjyvvmiywos.supabase.co'
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ??
  'sb_publishable_piYClqJExl-66UtA7EXTWA_AbN-MEyE'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
