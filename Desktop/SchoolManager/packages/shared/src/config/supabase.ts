import { createClient } from '@supabase/supabase-js'

export interface SupabaseConfig {
  url: string
  anonKey: string
}

export const createSupabaseClient = (config: SupabaseConfig) => {
  return createClient(config.url, config.anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  })
}

export type SupabaseClient = ReturnType<typeof createSupabaseClient>
