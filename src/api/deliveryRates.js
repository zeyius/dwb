import { supabase } from '../lib/supabase'

// Display only: the server re-reads the rate when the order is created.
export async function getDeliveryRates() {
  const { data, error } = await supabase
    .from('delivery_rates')
    .select('wilaya_code, home_price, desk_price, is_active')
  if (error) throw error
  return data
}
