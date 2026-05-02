import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(url, key)

export async function fetchTrades(userId, limit = 100) {
  const { data, error } = await supabase
    .from('trades')
    .select('*')
    .eq('user_id', userId)
    .order('entry_time', { ascending: false })
    .limit(limit)
  if (error) throw error
  return data || []
}

export async function insertTrade(trade) {
  const { data, error } = await supabase
    .from('trades')
    .insert(trade)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteTrade(id) {
  const { error } = await supabase.from('trades').delete().eq('id', id)
  if (error) throw error
}

export async function fetchSessions(userId) {
  const { data, error } = await supabase
    .from('sessions')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false })
  if (error) throw error
  return data || []
}
