import { supabase } from '../lib/supabase'

// Inactive categories are hidden by RLS.
export async function getCategories() {
  const { data, error } = await supabase
    .from('categories')
    .select('id, name, slug')
    .order('sort_order', { ascending: true })
  if (error) throw error
  return data
}
