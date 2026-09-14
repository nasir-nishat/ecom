import { defineMiddleware } from 'astro:middleware';
import { getViewer } from './lib/auth';
import { ROUTES } from './config/constants';

const PROTECTED = [/^\/admin(\/|$)/, /^\/api\/upload$/];

/** Gate admin pages + upload API behind a Supabase session with profiles.is_admin = true. */
export const onRequest = defineMiddleware(async (ctx, next) => {
  const { pathname } = ctx.url;
  if (!PROTECTED.some((re) => re.test(pathname))) return next();

  const viewer = await getViewer(ctx.request, ctx.cookies);
  ctx.locals.viewer = viewer;

  if (viewer.isAdmin) return next();
  if (pathname.startsWith('/api/')) return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 });
  return ctx.redirect(`${ROUTES.login}?next=${encodeURIComponent(pathname)}`);
});
