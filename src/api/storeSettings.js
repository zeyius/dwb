import { supabase } from '../lib/supabase'

// store_settings holds a single row with id = 1.
export async function getStoreSettings() {
  const { data, error } = await supabase
    .from('store_settings')
    .select('phone, email, instagram_url')
    .eq('id', 1)
    .single()
  if (error) throw error
  return data
}
