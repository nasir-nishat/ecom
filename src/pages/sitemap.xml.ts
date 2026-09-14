import type { APIRoute } from 'astro';
import { ROUTES, SITE } from '../config/constants';
import { listAllActiveProducts } from '../lib/catalog';

/** Dynamic sitemap — product routes are SSR so the static sitemap integration can't see them. */
export const GET: APIRoute = async () => {
  const products = await listAllActiveProducts();
  const urls = [
    { loc: SITE.url, lastmod: new Date().toISOString() },
    ...products.map((p) => ({ loc: `${SITE.url}${ROUTES.product(p.slug)}`, lastmod: p.updated_at })),
  ];
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${u.loc}</loc><lastmod>${u.lastmod}</lastmod></url>`).join('\n')}
</urlset>`;
  return new Response(body, { headers: { 'content-type': 'application/xml', 'cache-control': 'public, max-age=3600' } });
};
