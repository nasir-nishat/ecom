import { PAGE_SIZE } from '../config/constants';
import { demoCategories, demoProducts, demoSearch, isDemoMode } from './demo';
import { supabaseAnon } from './supabase';
import type { Category, Product } from '../types/ecom';

/** Single source of truth for catalog reads — pages, the MCP endpoint and the sitemap all use it. */

const PRODUCT_COLS =
  'id,slug,title,description,sku,brand,price,compare_at_price,currency,stock,rating,review_count,images,attributes,faqs,category_id,is_active,created_at,updated_at';

export type ListOpts = { page?: number; category?: string; q?: string; sale?: boolean; sort?: 'new' | 'popular' | 'price_asc' | 'price_desc'; limit?: number };

function sortDemo(items: Product[], sort: ListOpts['sort']) {
  const by: Record<NonNullable<ListOpts['sort']>, (a: Product, b: Product) => number> = {
    new: (a, b) => b.created_at.localeCompare(a.created_at),
    popular: (a, b) => b.review_count - a.review_count,
    price_asc: (a, b) => a.price - b.price,
    price_desc: (a, b) => b.price - a.price,
  };
  return [...items].sort(by[sort ?? 'new']);
}

export async function listProducts(opts: ListOpts = {}) {
  const page = Math.max(1, opts.page ?? 1);
  const size = opts.limit ?? PAGE_SIZE;
  const from = (page - 1) * size;

  if (isDemoMode()) {
    let all = demoSearch(demoProducts(), opts.q);
    if (opts.category) all = all.filter((p) => p.category_id === opts.category);
    if (opts.sale) all = all.filter((p) => p.compare_at_price && p.compare_at_price > p.price);
    all = sortDemo(all, opts.sort);
    return { items: all.slice(from, from + size), total: all.length, page, pageSize: size };
  }

  const order: Record<NonNullable<ListOpts['sort']>, [string, boolean]> = {
    new: ['created_at', false], popular: ['review_count', false], price_asc: ['price', true], price_desc: ['price', false],
  };
  const [col, asc] = order[opts.sort ?? 'new'];
  let query = supabaseAnon()
    .from('products')
    .select(PRODUCT_COLS, { count: 'exact' })
    .eq('is_active', true)
    .order(col, { ascending: asc })
    .range(from, from + size - 1);
  if (opts.category) query = query.eq('category_id', opts.category);
  if (opts.sale) query = query.not('compare_at_price', 'is', null);
  if (opts.q) query = query.textSearch('search', opts.q, { type: 'websearch' });

  const { data, count, error } = await query;
  if (error) throw error;
  return { items: (data ?? []) as Product[], total: count ?? 0, page, pageSize: size };
}

export async function getProductBySlug(slug: string) {
  if (isDemoMode()) return demoProducts().find((p) => p.slug === slug) ?? null;

  const { data, error } = await supabaseAnon().from('products').select(PRODUCT_COLS).eq('slug', slug).eq('is_active', true).maybeSingle();
  if (error) throw error;
  return (data as Product | null) ?? null;
}

/** Full active catalog for machine consumers (MCP catalog, sitemap). */
export async function listAllActiveProducts() {
  if (isDemoMode()) return demoProducts();

  const { data, error } = await supabaseAnon().from('products').select(PRODUCT_COLS).eq('is_active', true).order('updated_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as Product[];
}

export async function listCategories() {
  if (isDemoMode()) return demoCategories();

  const { data, error } = await supabaseAnon().from('categories').select('id,slug,name,parent_id').order('name');
  if (error) throw error;
  return (data ?? []) as Category[];
}
