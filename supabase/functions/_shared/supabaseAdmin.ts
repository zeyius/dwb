import { createClient, type SupabaseClient } from 'npm:@supabase/supabase-js@2'
import { env } from './http.ts'

// Server-side client; bypasses RLS, so it never leaves supabase/functions.
// Supabase injects SUPABASE_URL and the keys automatically. Prefer the new
// secret key (SUPABASE_SECRET_KEYS, JSON keyed by name) and fall back to the
// legacy SUPABASE_SERVICE_ROLE_KEY, which stops working at the end of 2026.
function secretKey(): string {
  const keys = Deno.env.get('SUPABASE_SECRET_KEYS')
  if (keys) {
    try {
      const key = JSON.parse(keys).default
      if (key) return key
    } catch {
      // fall through to the legacy key
    }
  }
  return env('SUPABASE_SERVICE_ROLE_KEY')
}

let admin: SupabaseClient | undefined
export function supabaseAdmin(): SupabaseClient {
  admin ??= createClient(env('SUPABASE_URL'), secretKey(), {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  return admin
}
