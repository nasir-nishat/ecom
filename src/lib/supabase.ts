import type { AstroCookies } from 'astro';
import { createClient } from '@supabase/supabase-js';
import { createBrowserClient, createServerClient, parseCookieHeader } from '@supabase/ssr';
import { PUBLIC_SUPABASE_ANON_KEY, PUBLIC_SUPABASE_URL } from 'astro:env/client';

/** Browser client (React islands). Cookie-backed so SSR sees the same session. */
export function supabaseBrowser() {
  return createBrowserClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY);
}

/** Per-request server client bound to the visitor's cookies (pages, API routes, middleware). */
export function supabaseServer(request: Request, cookies: AstroCookies) {
  return createServerClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
    cookies: {
      getAll: () =>
        parseCookieHeader(request.headers.get('cookie') ?? '').map(({ name, value }) => ({ name, value: value ?? '' })),
      setAll: (list) => list.forEach(({ name, value, options }) => cookies.set(name, value, options)),
    },
  });
}

/** Anonymous server client — public catalog reads with no user context (cacheable). */
export function supabaseAnon() {
  return createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, { auth: { persistSession: false } });
}
