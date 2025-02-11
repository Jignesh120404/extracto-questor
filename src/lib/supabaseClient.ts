
import { createClient } from '@supabase/supabase-js';

const getSupabaseCredentials = () => {
  const url = localStorage.getItem('SUPABASE_URL');
  const key = localStorage.getItem('SUPABASE_ANON_KEY');

  if (!url || !key) {
    const userUrl = window.prompt("Please enter your Supabase URL:");
    const userKey = window.prompt("Please enter your Supabase Anonymous Key:");
    
    if (userUrl && userKey) {
      localStorage.setItem('SUPABASE_URL', userUrl);
      localStorage.setItem('SUPABASE_ANON_KEY', userKey);
      return { url: userUrl, key: userKey };
    }
    throw new Error("Supabase credentials are required");
  }

  return { url, key };
};

const { url: supabaseUrl, key: supabaseAnonKey } = getSupabaseCredentials();

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
