'use server';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import type { User } from '@/types';

export interface InviteUserPayload {
  name: string;
  email: string;
  role: 'Admin' | 'Manager' | 'Viewer';
  userType: 'Default User';
}

export interface InviteResult {
  success: boolean;
  error?: string;
  inviteLink?: string;
}

/**
 * List all users from Supabase Auth admin API.
 * Returns real Supabase user IDs so delete/resend work correctly.
 */
export async function listUsers(): Promise<{ success: boolean; users?: User[]; error?: string }> {
  const supabase = await createClient();
  const { data: { user: caller } } = await supabase.auth.getUser();
  if (!caller) return { success: false, error: 'Not authenticated' };

  const callerRole = caller.user_metadata?.role as string | undefined;
  if (callerRole !== 'Admin' && callerRole !== 'Manager') {
    return { success: false, error: 'Insufficient permissions' };
  }

  const admin = createAdminClient();
  const { data, error } = await admin.auth.admin.listUsers({ perPage: 200 });
  if (error) return { success: false, error: error.message };

  const users: User[] = (data.users as { id: string; email?: string; user_metadata?: Record<string, unknown>; invited_at?: string; confirmed_at?: string; created_at: string }[]).map((u) => {
    const meta = (u.user_metadata ?? {}) as Record<string, string>;
    return {
      id:         u.id,
      email:      u.email ?? '',
      name:       meta.name ?? meta.full_name ?? u.email ?? 'Unknown',
      role:       (meta.role as User['role'])         ?? 'Viewer',
      userType:   (meta.userType as User['userType']) ?? 'Default User',
      status:     (u.invited_at && !u.confirmed_at) ? 'Pending' : ((meta.status as User['status']) ?? 'Active'),
      joinedDate: u.created_at ? u.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
    };
  });

  return { success: true, users };
}

/**
 * Invite a new user via Supabase Auth.
 * Uses the admin client so Supabase sends the invite email automatically.
 */
export async function inviteUser(payload: InviteUserPayload): Promise<InviteResult> {
  const supabase = await createClient();
  const { data: { user: caller } } = await supabase.auth.getUser();
  if (!caller) return { success: false, error: 'Not authenticated' };

  const callerRole = caller.user_metadata?.role as string | undefined;
  if (callerRole !== 'Admin' && callerRole !== 'Manager') {
    return { success: false, error: 'Insufficient permissions' };
  }

  const admin = createAdminClient();
  const redirectTo = `${process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'}/accept-invite`;

  const { data, error } = await admin.auth.admin.inviteUserByEmail(payload.email, {
    redirectTo,
    data: {
      name:     payload.name,
      role:     payload.role,
      userType: payload.userType,
      status:   'Pending',
    },
  });

  if (error) {
    if (error.message.toLowerCase().includes('already')) {
      return { success: false, error: 'A user with this email already exists.' };
    }
    return { success: false, error: error.message };
  }

  const inviteLink = data?.user ? `${redirectTo}?type=invite` : undefined;
  return { success: true, inviteLink };
}

/**
 * Remove a user entirely from Supabase Auth.
 * Only Admins can delete users.
 */
export async function deleteUser(targetUserId: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  const { data: { user: caller } } = await supabase.auth.getUser();
  if (!caller) return { success: false, error: 'Not authenticated' };

  const callerRole = caller.user_metadata?.role as string | undefined;
  if (callerRole !== 'Admin') {
    return { success: false, error: 'Only Admins can remove users' };
  }

  if (caller.id === targetUserId) {
    return { success: false, error: 'You cannot delete your own account' };
  }

  const admin = createAdminClient();
  const { error } = await admin.auth.admin.deleteUser(targetUserId);

  if (error) return { success: false, error: error.message };
  return { success: true };
}

/**
 * Resend an invite email to a Pending user.
 */
export async function resendInvite(email: string): Promise<InviteResult> {
  const supabase = await createClient();
  const { data: { user: caller } } = await supabase.auth.getUser();
  if (!caller) return { success: false, error: 'Not authenticated' };

  const admin = createAdminClient();
  const redirectTo = `${process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'}/accept-invite`;

  const { error } = await admin.auth.admin.inviteUserByEmail(email, { redirectTo });
  if (error) return { success: false, error: error.message };
  return { success: true };
}
