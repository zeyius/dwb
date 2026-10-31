import { supabase } from '../lib/supabase'
import { sessionCached } from './sessionCache'

// store_settings holds a single row with id = 1.
export function getStoreSettings() {
  return sessionCached('store_settings', async () => {
    const { data, error } = await supabase
      .from('store_settings')
      .select('phone, email, instagram_url, hero_image_url')
      .eq('id', 1)
      .single()
    if (error) throw error
    return data
  })
}
