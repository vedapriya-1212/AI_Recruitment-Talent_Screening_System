import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
// Select VITE_SUPABASE_KEY (JWT token) as primary, falling back to VITE_SUPABASE_ANON_KEY.
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase URL or Anonymous Key is missing in environment variables.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
