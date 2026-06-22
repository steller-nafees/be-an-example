import { createClient } from '@supabase/supabase-js'

// Read publishable (anon) credentials from environment only.
// Do NOT keep fallbacks or hardcoded keys in source.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

if (!supabaseUrl || !supabaseAnonKey) {
  // Warn in development if env vars are missing — do not hardcode keys.
  // Deployment environments should provide these via platform secrets.
  // eslint-disable-next-line no-console
  console.warn(
    'Missing Supabase environment variables. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment.'
  );
}

export const supabase = createClient(supabaseUrl ?? '', supabaseAnonKey ?? '')
