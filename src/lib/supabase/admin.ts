import { createClient } from '@supabase/supabase-js';

/**
 * Supabase admin client — uses the SERVICE ROLE key.
 * NEVER import this in client components or expose it to the browser.
 * Only use in Server Actions, API Routes, and server-side code.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SECRET_KEY;

  if (!url || !serviceKey) {
    throw new Error(
      'Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SECRET_KEY environment variables'
    );
  }

  return createClient(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
