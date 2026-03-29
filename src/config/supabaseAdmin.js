const { createClient } = require("@supabase/supabase-js");

let cachedClient = null;

const getSupabaseAdmin = () => {
  if (cachedClient) {
    return cachedClient;
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceRoleKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error(
      "SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_SERVICE_KEY) are required."
    );
  }

  cachedClient = createClient(supabaseUrl, supabaseServiceRoleKey);
  return cachedClient;
};

module.exports = { getSupabaseAdmin };
