
import { createClient } from '@supabase/supabase-js';
import type { Database } from '../integrations/supabase/types';

const supabaseUrl = "https://itnplqubgwouqakvhxaw.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml0bnBscXViZ3dvdXFha3ZoeGF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzkyNTM1NTEsImV4cCI6MjA1NDgyOTU1MX0._53K7nLW177fw7D3eAPqawczjxLnDRqZ3sKh53xPmWM";

export const supabase = createClient<Database>(supabaseUrl, supabaseKey);
