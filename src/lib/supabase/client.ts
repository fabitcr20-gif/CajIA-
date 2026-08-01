import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseEnv } from "@/lib/supabase/env";

let cached: SupabaseClient | null | undefined;

// Returns null when Supabase isn't configured — callers must treat that as
// "cloud sync disabled" and fall back to local-only behavior, never crash.
export function getSupabaseClient(): SupabaseClient | null {
  if (cached !== undefined) return cached;
  const env = getSupabaseEnv();
  if (!env) {
    cached = null;
    return null;
  }
  cached = createClient(env.url, env.anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false,
    },
  });
  return cached;
}
