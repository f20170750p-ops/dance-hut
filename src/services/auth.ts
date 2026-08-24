import type { AuthChangeEvent, Session, User } from '@supabase/supabase-js';
import { supabase } from './supabase';

export type UserRole = 'dancer' | 'choreographer' | 'studio';

export interface UserProfile {
  id: string;
  role: UserRole;
  display_name: string | null;
  email: string | null;
  studio_name?: string | null;
  choreo_name?: string | null;
  configured_roles?: UserRole[];
  created_at?: string;
}

export async function signUpWithEmailPassword(
  email: string,
  password: string,
  displayName?: string,
  role?: UserRole
) {
  const trimmedName = displayName?.trim();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: window.location.origin,
      data: {
        ...(trimmedName ? { display_name: trimmedName, full_name: trimmedName } : {}),
        ...(role ? { role, configured_roles: [role] } : { role: 'dancer', configured_roles: ['dancer'] }),
      },
    },
  });
  return { data, error };
}

export async function signInWithEmailPassword(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  return { data, error };
}

export async function saveProfile(
  userId: string,
  role: UserRole,
  email: string,
  displayName?: string | null,
  studioName?: string | null,
  choreoName?: string | null,
  configuredRoles?: UserRole[]
) {
  const payload: any = {
    id: userId,
    role,
    email,
  };
  const trimmedName = displayName?.trim();
  if (trimmedName) {
    payload.display_name = trimmedName;
  }
  if (studioName) payload.studio_name = studioName.trim();
  if (choreoName) payload.choreo_name = choreoName.trim();
  if (configuredRoles) payload.configured_roles = configuredRoles;

  const { error } = await supabase.from('profiles').upsert(payload);
  return { error };
}

export async function getProfile(userId: string): Promise<{ data: UserProfile | null; error: Error | null }> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  return { data: (data as UserProfile | null) ?? null, error: error ? new Error(error.message) : null };
}

export async function updateProfile(
  userId: string,
  updates: {
    display_name?: string;
    role?: UserRole;
    studio_name?: string | null;
    choreo_name?: string | null;
    configured_roles?: UserRole[];
  }
): Promise<{ data: UserProfile | null; error: Error | null }> {
  await supabase.auth.updateUser({
    data: {
      ...(updates.display_name !== undefined ? { display_name: updates.display_name, full_name: updates.display_name } : {}),
      ...(updates.role !== undefined ? { role: updates.role } : {}),
      ...(updates.studio_name !== undefined ? { studio_name: updates.studio_name } : {}),
      ...(updates.choreo_name !== undefined ? { choreo_name: updates.choreo_name } : {}),
      ...(updates.configured_roles !== undefined ? { configured_roles: updates.configured_roles } : {}),
    },
  });

  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select('*')
    .single();

  if (error) {
    // If update on custom columns fails (e.g. if column doesn't exist yet in remote table), update basic columns
    const fallbackUpdate: any = {};
    if (updates.display_name !== undefined) fallbackUpdate.display_name = updates.display_name;
    if (updates.role !== undefined) fallbackUpdate.role = updates.role;

    const fallbackResult = await supabase
      .from('profiles')
      .update(fallbackUpdate)
      .eq('id', userId)
      .select('*')
      .single();

    return { data: (fallbackResult.data as UserProfile | null) ?? null, error: fallbackResult.error ? new Error(fallbackResult.error.message) : null };
  }

  return { data: (data as UserProfile | null) ?? null, error: error ? new Error(error.message) : null };
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  return { error };
}

export function onAuthStateChange(callback: (event: AuthChangeEvent, session: Session | null) => void) {
  return supabase.auth.onAuthStateChange(callback);
}

export async function getSession() {
  const { data, error } = await supabase.auth.getSession();
  return { session: data.session, error };
}

export async function getUser(): Promise<User | null> {
  const { data } = await supabase.auth.getUser();
  return data.user;
}

export function getDisplayName(
  profile: { display_name?: string | null; studio_name?: string | null; choreo_name?: string | null; role?: UserRole } | null,
  user: User | null,
  roleContext?: UserRole
): string {
  const currentRole = roleContext || profile?.role || (user?.user_metadata?.role as UserRole) || 'dancer';

  if (currentRole === 'studio') {
    if (profile?.studio_name && profile.studio_name.trim().length > 0) {
      return profile.studio_name.trim();
    }
    const metaStudio = user?.user_metadata?.studio_name;
    if (metaStudio && typeof metaStudio === 'string' && metaStudio.trim().length > 0) {
      return metaStudio.trim();
    }
  }

  if (currentRole === 'choreographer') {
    if (profile?.choreo_name && profile.choreo_name.trim().length > 0) {
      return profile.choreo_name.trim();
    }
    const metaChoreo = user?.user_metadata?.choreo_name;
    if (metaChoreo && typeof metaChoreo === 'string' && metaChoreo.trim().length > 0) {
      return metaChoreo.trim();
    }
  }

  if (profile?.display_name && profile.display_name.trim().length > 0) {
    return profile.display_name.trim();
  }
  const metaName = user?.user_metadata?.display_name || user?.user_metadata?.full_name || user?.user_metadata?.name;
  if (metaName && typeof metaName === 'string' && metaName.trim().length > 0) {
    return metaName.trim();
  }
  if (user?.email) {
    const emailPrefix = user.email.split('@')[0];
    const formatted = emailPrefix
      .split(/[._-]+/)
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
      .join(' ');
    if (formatted) return formatted;
    return emailPrefix;
  }
  return currentRole === 'studio' ? 'Dance Studio' : 'Dancer';
}

export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'DH';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function getRoleBadge(role?: string | null): string {
  switch (role) {
    case 'choreographer':
      return 'Choreographer';
    case 'studio':
      return 'Studio';
    case 'dancer':
    default:
      return 'Dancer';
  }
}
