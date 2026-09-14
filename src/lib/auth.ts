import type { AstroCookies } from 'astro';
import { DEMO_ADMIN, isDemoMode } from './demo';
import { supabaseServer } from './supabase';
import type { Profile } from '../types/ecom';

export interface Viewer {
  user: { id: string; email: string } | null;
  profile: Profile | null;
  isAdmin: boolean;
}

/** Resolve the current visitor + admin flag in one call. Safe to call on every request. */
export async function getViewer(request: Request, cookies: AstroCookies): Promise<Viewer> {
  if (isDemoMode()) return { user: DEMO_ADMIN, profile: { ...DEMO_ADMIN, is_admin: true }, isAdmin: true };

  const sb = supabaseServer(request, cookies);
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return { user: null, profile: null, isAdmin: false };

  const { data: profile } = await sb.from('profiles').select('id,email,is_admin').eq('id', user.id).maybeSingle();
  return {
    user: { id: user.id, email: user.email ?? '' },
    profile: (profile as Profile | null) ?? null,
    isAdmin: Boolean(profile?.is_admin),
  };
}
