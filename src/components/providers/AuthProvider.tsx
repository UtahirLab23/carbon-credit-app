// @ts-nocheck
'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User } from '@/types';
import type { ApiCredentials } from '@/types/api';
import { mockUsers } from '@/utils/mockData';
import { setCredentials, clearCredentials } from '@/services/investorApi';
import { createClient } from '@/lib/supabase/client';

export interface AuthContextType {
  currentUser: User | null;
  users: User[];
  logout: () => void;
  inviteUser: (name: string, email: string, role: User['role'], userType: User['userType']) => void;
  removeUser: (id: string) => void;
  can: (action: 'invite' | 'delete_user' | 'view_users') => boolean;
  apiCredentials: ApiCredentials | null;
  saveApiCredentials: (creds: ApiCredentials | null) => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [apiCredentials, setApiCredentialsState] = useState<ApiCredentials | null>(null);

  // Sync currentUser from Supabase session on mount
  useEffect(() => {
    const supabase = createClient();

    const syncUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Match by email to find the mock user record (or create a default Admin)
        const matched = mockUsers.find(
          (u) => u.email.toLowerCase() === (user.email ?? '').toLowerCase()
        );
        setCurrentUser(matched ?? {
          id: user.id,
          name: user.user_metadata?.full_name ?? user.email ?? 'User',
          email: user.email ?? '',
          role: 'Admin',
          userType: 'Default User',
          status: 'Active',
          joinedDate: new Date().toISOString().split('T')[0],
        });
      } else {
        setCurrentUser(null);
      }
    };

    syncUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      syncUser();
    });

    return () => subscription.unsubscribe();
  }, []);

  const saveApiCredentials = (creds: ApiCredentials | null) => {
    setApiCredentialsState(creds);
    if (creds) {
      setCredentials(creds);
    } else {
      clearCredentials();
    }
  };

  const logout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setCurrentUser(null);
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
      invite: ['Admin', 'Manager'],
      delete_user: ['Admin'],
      view_users: ['Admin', 'Manager'],
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
      apiCredentials,
      saveApiCredentials,
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
