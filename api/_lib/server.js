// Server-only helpers for the /api functions. Files under api/_lib are not
// deployed as endpoints (Vercel skips names starting with "_").
//
// Secrets come from server env vars only: never VITE_-prefixed, never
// imported from src/. The service role key bypasses RLS, so it must not leave
// this directory.
import { createClient } from '@supabase/supabase-js'

export function env(name) {
  const value = process.env[name]
  if (!value) throw new Error(`Missing server env var ${name}`)
  return value
}

let admin
export function supabaseAdmin() {
  admin ??= createClient(env('SUPABASE_URL'), env('SUPABASE_SERVICE_ROLE_KEY'), {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  return admin
}

export const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
  })

// Thrown for anything the customer can fix; becomes { error, ...extra }.
export class HttpError extends Error {
  constructor(status, message, extra = {}) {
    super(message)
    this.status = status
    this.extra = extra
  }
}

// Wraps a handler so HttpErrors become JSON responses and anything else is
// logged and returned as a generic 500 (no internals leak to the client).
export const handle = (fn) => async (request) => {
  try {
    return await fn(request)
  } catch (err) {
    if (err instanceof HttpError) return json({ error: err.message, ...err.extra }, err.status)
    console.error(err)
    return json({ error: 'Something went wrong. Please try again.' }, 500)
  }
}
