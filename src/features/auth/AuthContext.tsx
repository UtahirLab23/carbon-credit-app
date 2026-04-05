import React, { createContext, useContext, useState } from 'react';
import type { User } from '../../types';
import { mockUsers } from '../../utils/mockData';

export interface AuthContextType {
  currentUser: User | null;
  users: User[];
  login: (email: string, password: string) => boolean;
  logout: () => void;
  inviteUser: (name: string, email: string, role: User['role'], userType: User['userType']) => void;
  removeUser: (id: string) => void;
  can: (action: 'invite' | 'delete_user' | 'view_users') => boolean;
}

export const AuthContext = createContext<AuthContextType | null>(null);

const SESSION_KEY = 'ccx_user_id';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(mockUsers);

  // Persisted session: restore from localStorage on mount
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const savedId = localStorage.getItem(SESSION_KEY);
    return savedId ? (mockUsers.find((u) => u.id === savedId) ?? null) : null;
  });

  const login = (email: string, password: string): boolean => {
    void password; // static app – no real auth
    const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    const resolved = user ?? (email === 'admin@demo.com' ? users[0] : null);
    if (resolved) {
      setCurrentUser(resolved);
      localStorage.setItem(SESSION_KEY, resolved.id);
      return true;
    }
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem(SESSION_KEY);
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

  // Role-based access control
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
    <AuthContext.Provider value={{ currentUser, users, login, logout, inviteUser, removeUser, can }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
