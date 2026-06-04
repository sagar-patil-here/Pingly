import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.warn("Missing Supabase environment variables. Database connections will fail.");
}

export const supabase = createClient(supabaseUrl, supabaseKey);
