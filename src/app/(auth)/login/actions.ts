'use server';

import { createClient } from '@/lib/supabase/server';

export async function signIn(
  formData: FormData
): Promise<{ error?: string; accessToken?: string; refreshToken?: string; expiresAt?: number }> {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  });

  if (error) {
    return { error: error.message };
  }

  return {
    accessToken:  data.session?.access_token,
    refreshToken: data.session?.refresh_token,
    expiresAt:    data.session?.expires_at,
  };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
}
