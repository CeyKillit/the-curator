import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    "Configure NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no arquivo .env.local"
  );
}

// Cliente com service role — usado exclusivamente em rotas de servidor (API routes).
// Nunca exponha este cliente no browser.
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false },
});
