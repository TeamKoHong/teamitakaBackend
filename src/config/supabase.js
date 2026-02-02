const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let supabase = null;

if (supabaseUrl && supabaseServiceRoleKey) {
  supabase = createClient(supabaseUrl, supabaseServiceRoleKey);
  console.log('✅ Supabase client initialized');
} else {
  console.warn('⚠️ SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is not set - Supabase email verification will not work');
}

module.exports = supabase;
