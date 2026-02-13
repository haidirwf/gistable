import { createClient } from '@supabase/supabase-js';

// Konfigurasi Supabase
const SUPABASE_URL = 'YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';

export let supabaseClient = null;
export let supabaseEnabled = false;

// Cek apakah user sudah mengganti placeholder
if (
  SUPABASE_URL !== 'YOUR_SUPABASE_URL' &&
  SUPABASE_ANON_KEY !== 'YOUR_SUPABASE_ANON_KEY'
) {
  supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  supabaseEnabled = true;
}