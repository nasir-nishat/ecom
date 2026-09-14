import type { AstroCookies } from 'astro';
import { demoCategories, demoProducts, isDemoMode } from './demo';
import { supabaseServer } from './supabase';
import type { Category, Product } from '../types/ecom';

/** Admin reads (all products incl. hidden). Admin pages call these, never Supabase directly. */

export async function adminListProducts(request: Request, cookies: AstroCookies) {
  if (isDemoMode()) return demoProducts();
  const { data, error } = await supabaseServer(request, cookies).from('products').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as Product[];
}

export async function adminListCategories(request: Request, cookies: AstroCookies) {
  if (isDemoMode()) return demoCategories();
  const { data, error } = await supabaseServer(request, cookies).from('categories').select('id,slug,name,parent_id').order('name');
  if (error) throw error;
  return (data ?? []) as Category[];
}

export async function adminStats(request: Request, cookies: AstroCookies) {
  if (isDemoMode()) {
    const ps = demoProducts();
    return { products: ps.length, lowStock: ps.filter((p) => p.stock <= 5).length, inquiries: 0 };
  }
  const sb = supabaseServer(request, cookies);
  const [{ count: products }, { count: lowStock }, { count: inquiries }] = await Promise.all([
    sb.from('products').select('id', { count: 'exact', head: true }),
    sb.from('products').select('id', { count: 'exact', head: true }).lte('stock', 5),
    sb.from('inquiries').select('id', { count: 'exact', head: true }),
  ]);
  return { products: products ?? 0, lowStock: lowStock ?? 0, inquiries: inquiries ?? 0 };
}
