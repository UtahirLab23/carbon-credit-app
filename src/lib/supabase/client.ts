import { createBrowserClient } from '@supabase/ssr';
import { useEffect, useState } from 'react';
import { hasCredentials, setCredentials, clearCredentials } from '@/services/investorApi';
import type { ApiCredentials } from '@/types/api';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export interface CurrentUser {
  id: string;
  email: string;
  name: string;
  role: string;
  userType: string;
  status: string;
}

export function useAuth() {
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [apiCredentials, setApiCredentials] = useState<ApiCredentials | null>(null);

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setCurrentUser({
          id: user.id,
          email: user.email ?? '',
          name: user.user_metadata?.name ?? user.email ?? 'User',
          role: user.user_metadata?.role ?? 'Viewer',
          userType: user.user_metadata?.userType ?? 'Default User',
          status: user.user_metadata?.status ?? 'Active',
        });
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setCurrentUser({
          id: session.user.id,
          email: session.user.email ?? '',
          name: session.user.user_metadata?.name ?? session.user.email ?? 'User',
          role: session.user.user_metadata?.role ?? 'Viewer',
          userType: session.user.user_metadata?.userType ?? 'Default User',
          status: session.user.user_metadata?.status ?? 'Active',
        });
      } else {
        setCurrentUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const saveCredentials = (creds: ApiCredentials) => {
    setCredentials(creds);
    setApiCredentials(creds);
  };

  const removeCredentials = () => {
    clearCredentials();
    setApiCredentials(null);
  };

  return { currentUser, apiCredentials, saveCredentials, removeCredentials, hasCredentials: hasCredentials() };
}
