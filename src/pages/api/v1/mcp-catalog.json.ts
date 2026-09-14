import type { APIRoute } from 'astro';
import { ROUTES, SITE } from '../../../config/constants';
import { listAllActiveProducts } from '../../../lib/catalog';
import { availabilityOf } from '../../../lib/geo-schema';
import { json } from '../../../lib/http';

/**
 * Machine-readable catalog for AI shopping agents.
 * Stable contract: bump `schema_version` on breaking changes.
 */
export const GET: APIRoute = async () => {
  const products = await listAllActiveProducts();
  return json(
    {
      schema_version: '1.0',
      generated_at: new Date().toISOString(),
      store: { name: SITE.name, url: SITE.url, currency: SITE.currency },
      endpoints: {
        catalog: `${SITE.url}${ROUTES.mcpCatalog}`,
        inquiry: { method: 'POST', url: `${SITE.url}/api/inquiry`, fields: ['name', 'email', 'message', 'product_id?', 'captcha_token?'] },
      },
      products: products.map((p) => ({
        id: p.id,
        sku: p.sku,
        name: p.title,
        description: p.description,
        brand: p.brand,
        url: `${SITE.url}${ROUTES.product(p.slug)}`,
        images: p.images,
        price: { amount: p.price, currency: p.currency, compare_at: p.compare_at_price },
        stock: p.stock,
        availability: availabilityOf(p.stock),
        attributes: p.attributes,
        updated_at: p.updated_at,
      })),
    },
    { headers: { 'cache-control': 'public, max-age=60, s-maxage=300' } },
  );
};
