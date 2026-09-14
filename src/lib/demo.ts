import { PUBLIC_DEMO_MODE, PUBLIC_SUPABASE_ANON_KEY } from 'astro:env/client';
import demo from '../data/demo-catalog.json';
import type { Category, Product } from '../types/ecom';

/**
 * Demo mode = the store runs with no Supabase at all (clone → `pnpm dev`).
 * `auto` (default) turns it on whenever PUBLIC_SUPABASE_ANON_KEY is empty.
 * Data comes from src/data/demo-catalog.json; writes are accepted but not persisted.
 */
export function isDemoMode() {
  if (PUBLIC_DEMO_MODE === 'on') return true;
  if (PUBLIC_DEMO_MODE === 'off') return false;
  return !PUBLIC_SUPABASE_ANON_KEY;
}

export const DEMO_ADMIN = { id: 'demo-admin', email: 'demo@localhost' };

export const demoProducts = () => demo.products as unknown as Product[];
export const demoCategories = () => demo.categories as Category[];

export function demoSearch(items: Product[], q?: string) {
  if (!q) return items;
  const terms = q.toLowerCase().split(/\s+/).filter(Boolean);
  return items.filter((p) => {
    const hay = `${p.title} ${p.brand ?? ''} ${p.description}`.toLowerCase();
    return terms.every((t) => hay.includes(t));
  });
}
