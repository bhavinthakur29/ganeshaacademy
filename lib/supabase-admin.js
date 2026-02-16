/**
 * Supabase admin client using service role key.
 * Use ONLY in server-side API routes for privileged operations (e.g. creating auth users).
 * Never expose this client to the browser.
 */
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.warn(
    "Supabase admin: set SUPABASE_SERVICE_ROLE_KEY in .env.local for instructor creation"
  );
}

export const supabaseAdmin = supabaseUrl && serviceRoleKey
  ? createClient(supabaseUrl, serviceRoleKey, { auth: { autoRefreshToken: false, persistSession: false } })
  : null;
