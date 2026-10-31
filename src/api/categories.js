import { supabase } from '../lib/supabase'
import { sessionCached } from './sessionCache'

// Inactive categories are hidden by RLS.
export function getCategories() {
  return sessionCached('categories', async () => {
    const { data, error } = await supabase
      .from('categories')
      .select('name, slug')
      .order('sort_order', { ascending: true })
    if (error) throw error
    return data
  })
}
