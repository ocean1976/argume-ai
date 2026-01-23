import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

// Ana client
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Server-side client için
export const createServerSupabaseClient = () => {
  return createClient(supabaseUrl!, supabaseAnonKey!)
}

// createClient'ı da export et (supabase-queries.ts için)
export { createClient } from '@supabase/supabase-js'
