import { PUBLIC_CURRENCY, PUBLIC_SITE_NAME, PUBLIC_SITE_URL } from 'astro:env/client';

export const SITE = {
  name: PUBLIC_SITE_NAME,
  url: PUBLIC_SITE_URL.replace(/\/$/, ''),
  currency: PUBLIC_CURRENCY,
  description: 'Lightweight, AI-agent-ready e-commerce storefront.',
  /** Top announcement bar; empty string hides it. */
  announcement: 'Free shipping on orders over $50 · Use code WELCOME10 for 10% off',
  social: { instagram: '#', facebook: '#', youtube: '#' },
} as const;

export const ROUTES = {
  home: '/',
  shop: '/?sort=popular',
  sale: '/?sale=1',
  newArrivals: '/?sort=new',
  category: (id: string) => `/?category=${id}`,
  product: (slug: string) => `/product/${slug}`,
  login: '/login',
  register: '/register',
  admin: '/admin',
  adminProducts: '/admin/products',
  mcpCatalog: '/api/v1/mcp-catalog.json',
} as const;

/** Home hero copy. Edit here; layout lives in components/home/Hero.astro. */
export const HERO = {
  eyebrow: 'New arrivals',
  title: 'Discover the best products for you',
  subtitle: 'Thoughtfully made essentials for wardrobe and home — honest prices, quick delivery, easy returns.',
  primaryCta: { label: 'Shop now', href: ROUTES.shop },
  secondaryCta: { label: 'Explore deals', href: ROUTES.sale },
  trust: 'Trusted by 10,000+ happy customers',
} as const;

/** Trust strip under the hero. `icon` = Lucide icon name (https://lucide.dev/icons). */
export const USPS = [
  { icon: 'Truck', title: 'Free shipping', text: 'On orders over $50' },
  { icon: 'ShieldCheck', title: 'Secure payment', text: '100% secure checkout' },
  { icon: 'RotateCcw', title: 'Easy returns', text: '30-day return policy' },
  { icon: 'Headphones', title: '24/7 support', text: 'Dedicated help desk' },
] as const;

export const PROMO = {
  eyebrow: 'Special offer',
  title: 'Up to 50% off',
  text: 'Limited-time offer on selected items. Hurry up and grab the best deals!',
  cta: { label: 'Shop the sale', href: ROUTES.sale },
} as const;

export const PAGE_SIZE = 24;
export const HOME_RAIL_SIZE = 10;

/** Allowed upload types for product media. */
export const MEDIA_MIME = ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif', 'video/mp4', 'video/webm'];
export const MEDIA_MAX_BYTES = 25 * 1024 * 1024;
