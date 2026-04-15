// @ts-nocheck
'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import type { User } from '@/types';
import { mockUsers } from '@/utils/mockData';
import { createClient } from '@/lib/supabase/client';

export interface AuthContextType {
  currentUser: User | null;
  users: User[];
  logout: () => void;
  inviteUser: (name: string, email: string, role: User['role'], userType: User['userType']) => void;
  removeUser: (id: string) => void;
  can: (action: 'invite' | 'delete_user' | 'view_users') => boolean;
}

export const AuthContext = createContext<AuthContextType | null>(null);

/** Build our internal User shape from a Supabase auth user object.
 *  Priority: user_metadata fields → mockUsers email match → safe defaults.
 */
function buildUser(supaUser: SupabaseUser): User {
  // Prefer metadata set at invite / seed time
  const meta = supaUser.user_metadata ?? {};

  // Fall back to mockUsers for legacy seeded accounts that have metadata
  const matched = mockUsers.find(
    (u) => u.email.toLowerCase() === (supaUser.email ?? '').toLowerCase()
  );

  return {
    id:         supaUser.id,
    email:      supaUser.email ?? '',
    name:       meta.name ?? meta.full_name ?? matched?.name ?? supaUser.email ?? 'User',
    role:       meta.role       ?? matched?.role       ?? 'Viewer',
    userType:   meta.userType   ?? matched?.userType   ?? 'Default User',
    status:     meta.status     ?? matched?.status     ?? 'Active',
    joinedDate: matched?.joinedDate ?? new Date().toISOString().split('T')[0],
  };
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    const supabase = createClient();

    // onAuthStateChange fires immediately with INITIAL_SESSION on mount,
    // passing the current session directly — no separate getSession() call needed.
    // This is the single source of truth and avoids any race condition.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setCurrentUser(session?.user ? buildUser(session.user) : null);
      }
    );

    // ── "Remember Me = off" enforcement ──────────────────────────────────────
    // How it works (two-key system):
    //
    //   localStorage  'ccx_remember' = '0'  → user chose "don't remember"
    //   sessionStorage 'ccx_session_alive' = '1' → tab/browser is still open
    //
    // When the browser CLOSES, sessionStorage is wiped automatically by the browser.
    // On next browser OPEN, sessionStorage is empty but localStorage still has '0'.
    // We detect this combination and sign the user out.
    //
    // During a normal page REFRESH, sessionStorage survives → no sign-out.
    (async () => {
      const rememberChoice  = localStorage.getItem('ccx_remember');    // '0' or '1' or null
      const sessionAlive    = sessionStorage.getItem('ccx_session_alive'); // '1' or null

      if (rememberChoice === '0' && !sessionAlive) {
        // Browser was closed and reopened — enforce session-only
        const { data } = await supabase.auth.getSession();
        if (data.session) {
          await supabase.auth.signOut();
          localStorage.removeItem('ccx_remember');
          window.location.href = '/login';
        }
      }
    })();

    return () => subscription.unsubscribe();
  }, []);

  const logout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    // Clear remember-me markers so the next login prompts fresh
    localStorage.removeItem('ccx_remember');
    sessionStorage.removeItem('ccx_session_alive');
    // signOut triggers onAuthStateChange → SIGNED_OUT → setCurrentUser(null)
    window.location.href = '/login';
  };

  const inviteUser = (
    name: string,
    email: string,
    role: User['role'],
    userType: User['userType']
  ) => {
    const newUser: User = {
      id: Date.now().toString(),
      name,
      email,
      role,
      userType,
      status: 'Pending',
      joinedDate: new Date().toISOString().split('T')[0],
    };
    setUsers((prev) => [...prev, newUser]);
  };

  const removeUser = (id: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== id));
  };

  const can = (action: 'invite' | 'delete_user' | 'view_users'): boolean => {
    const role = currentUser?.role;
    if (!role) return false;
    const rules: Record<typeof action, User['role'][]> = {
      invite:      ['Admin', 'Manager'],
      delete_user: ['Admin'],
      view_users:  ['Admin', 'Manager'],
    };
    return rules[action].includes(role);
  };

  return (
    <AuthContext.Provider value={{
      currentUser,
      users,
      logout,
      inviteUser,
      removeUser,
      can,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

