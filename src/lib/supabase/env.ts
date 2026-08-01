// Supabase is optional: CajIA works fully offline/local-only if these
// aren't configured (e.g. this sandbox, or a fresh clone before the owner
// connects their own Supabase project). Every read is lazy so a missing
// env var never breaks `next build`, and callers treat `null` as "cloud
// sync disabled" rather than throwing.

export interface SupabaseEnv {
  url: string;
  anonKey: string;
}

export function getSupabaseEnv(): SupabaseEnv | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return null;
  return { url, anonKey };
}
