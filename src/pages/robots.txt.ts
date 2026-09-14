import type { APIRoute } from 'astro';
import { SITE } from '../config/constants';

/** Explicitly welcome AI crawlers alongside search engines; keep admin/API private. */
export const GET: APIRoute = () =>
  new Response(
    `User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/upload

User-agent: GPTBot
Allow: /
User-agent: ClaudeBot
Allow: /
User-agent: PerplexityBot
Allow: /

Sitemap: ${SITE.url}/sitemap.xml
`,
    { headers: { 'content-type': 'text/plain' } },
  );
