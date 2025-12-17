import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
    // Do not throw error immediately to allow build to pass if envs irrelevant
    console.warn('Supabase URL or Key missing')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
