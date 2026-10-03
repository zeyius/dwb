import { FunctionsHttpError } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

// Calls the create-checkout Edge Function. Returns { ok, body } for any
// response from the function, including errors it sends on purpose (sold
// items, invalid fields...): on a non-2xx, invoke() doesn't return the body
// as data but as a Response on error.context. Throws only when the function
// couldn't be reached at all.
export async function createCheckout(payload) {
  const { data, error } = await supabase.functions.invoke('create-checkout', { body: payload })
  if (!error) return { ok: true, body: data ?? {} }
  if (error instanceof FunctionsHttpError) {
    const body = await error.context.json().catch(() => ({}))
    return { ok: false, body }
  }
  throw error
}
