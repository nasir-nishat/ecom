import { ROUTES, SITE } from '../config/constants';
import type { Product } from '../types/ecom';

/** JSON-LD builders. Each returns a plain object; <SchemaOrg> serialises an array of them into <head>. */

export type JsonLd = Record<string, unknown>;

export function organizationSchema(): JsonLd {
  return { '@type': 'Organization', name: SITE.name, url: SITE.url };
}

export function websiteSchema(): JsonLd {
  return {
    '@type': 'WebSite',
    name: SITE.name,
    url: SITE.url,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${SITE.url}/?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };
}

export function breadcrumbSchema(items: { name: string; path: string }[]): JsonLd {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      item: `${SITE.url}${it.path}`,
    })),
  };
}

export function availabilityOf(stock: number) {
  return `https://schema.org/${stock > 0 ? 'InStock' : 'OutOfStock'}`;
}

export function productSchema(p: Product): JsonLd {
  const url = `${SITE.url}${ROUTES.product(p.slug)}`;
  return {
    '@type': 'Product',
    '@id': `${url}#product`,
    name: p.title,
    description: p.description,
    sku: p.sku,
    image: p.images,
    url,
    brand: p.brand ? { '@type': 'Brand', name: p.brand } : undefined,
    additionalProperty: Object.entries(p.attributes ?? {}).map(([name, value]) => ({
      '@type': 'PropertyValue',
      name,
      value,
    })),
    aggregateRating:
      p.rating && p.review_count > 0
        ? { '@type': 'AggregateRating', ratingValue: p.rating, reviewCount: p.review_count, bestRating: 5 }
        : undefined,
    offers: {
      '@type': 'Offer',
      url,
      price: p.price,
      priceCurrency: p.currency,
      availability: availabilityOf(p.stock),
      itemCondition: 'https://schema.org/NewCondition',
      seller: organizationSchema(),
    },
  };
}

export function faqSchema(p: Product): JsonLd | null {
  if (!p.faqs?.length) return null;
  return {
    '@type': 'FAQPage',
    mainEntity: p.faqs.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  };
}

/** Wrap a list of nodes into a single @graph document (drops nulls/undefined). */
export function toGraph(nodes: (JsonLd | null | undefined)[]) {
  return JSON.stringify({ '@context': 'https://schema.org', '@graph': nodes.filter(Boolean) });
}
