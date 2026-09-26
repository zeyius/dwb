import { supabase } from '../lib/supabase'

const FIELDS = 'id, name, description, size, price, images, is_new, is_sold, created_at'

// Lists products newest first. `categorySlug` filters through the categories
// relation; `!inner` turns the embed into a join so non-matching rows drop out.
export async function getProducts({ categorySlug, offset = 0, limit = 8 } = {}) {
  let query = supabase
    .from('products')
    .select(`${FIELDS}, categories${categorySlug ? '!inner' : ''}(name, slug)`, { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (categorySlug) query = query.eq('categories.slug', categorySlug)

  const { data, count, error } = await query
  // Offset past the end (e.g. products removed since the last page) is just an empty page.
  if (error?.code === 'PGRST103') return { items: [], total: offset }
  if (error) throw error
  return { items: data, total: count ?? 0 }
}

// Returns null when no product has this id (including ids that aren't valid uuids).
export async function getProductById(id) {
  const { data, error } = await supabase
    .from('products')
    .select(`${FIELDS}, categories(name, slug)`)
    .eq('id', id)
    .maybeSingle()
  if (error?.code === '22P02') return null
  if (error) throw error
  return data
}
