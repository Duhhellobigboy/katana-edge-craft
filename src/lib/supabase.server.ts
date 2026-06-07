import { createClient } from "@supabase/supabase-js";
import { ensureServerEnv, getEnvVar, sanitizeEnvValue } from "./env.server";

export function createSupabaseServerClient() {
  ensureServerEnv();

  const supabaseUrl =
    getEnvVar("VITE_SUPABASE_URL") ||
    sanitizeEnvValue(import.meta.env.VITE_SUPABASE_URL);
  const serviceRoleKey = getEnvVar("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      "Missing server-side Supabase environment variables. Make sure VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set.",
    );
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
