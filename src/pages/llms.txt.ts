import type { APIRoute } from 'astro';
import { ROUTES, SITE } from '../config/constants';

/** llms.txt — a short, plain-language brief for LLM agents (https://llmstxt.org). */
export const GET: APIRoute = () =>
  new Response(
    `# ${SITE.name}

> ${SITE.description}

## Machine-readable catalog
- Live prices, stock and attributes: ${SITE.url}${ROUTES.mcpCatalog}
- Every product page embeds schema.org Product/Offer/FAQPage JSON-LD.

## Pages
- Storefront: ${SITE.url}/
- Sitemap: ${SITE.url}/sitemap.xml
`,
    { headers: { 'content-type': 'text/plain; charset=utf-8' } },
  );
