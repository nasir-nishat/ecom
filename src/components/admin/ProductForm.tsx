import { useState } from 'react';
import { z } from 'zod';
import { isDemoMode } from '../../lib/demo';
import { supabaseBrowser } from '../../lib/supabase';
import type { Category, Product, ProductInput } from '../../types/ecom';
import MediaUploader from './MediaUploader';

const schema = z.object({
  title: z.string().min(2),
  slug: z.string().regex(/^[a-z0-9-]+$/, 'lowercase letters, numbers and dashes'),
  sku: z.string().min(1),
  brand: z.string().optional(),
  description: z.string().min(10),
  price: z.coerce.number().nonnegative(),
  compare_at_price: z.coerce.number().nonnegative().optional(),
  stock: z.coerce.number().int().nonnegative(),
  category_id: z.string().optional(),
  is_active: z.boolean(),
  attributes: z.string().transform((s, ctx) => {
    try { return s.trim() ? (JSON.parse(s) as Record<string, string | number | boolean>) : {}; }
    catch { ctx.addIssue({ code: 'custom', message: 'Attributes must be valid JSON' }); return z.NEVER; }
  }),
});

interface Props {
  product?: Product;
  categories: Category[];
  currency: string;
}

/** Create/edit a product. Writes go straight to Supabase; RLS permits only admins. */
export default function ProductForm({ product, categories, currency }: Props) {
  const [images, setImages] = useState<string[]>(product?.images ?? []);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [message, setMessage] = useState('');

  async function onSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const raw = Object.fromEntries(fd.entries());
    const parsed = schema.safeParse({ ...raw, is_active: fd.get('is_active') === 'on' });
    if (!parsed.success) {
      setErrors(Object.fromEntries(parsed.error.issues.map((i) => [String(i.path[0]), i.message])));
      return;
    }
    setErrors({});
    if (isDemoMode()) { setStatus('error'); setMessage('Demo mode: changes are not saved. Connect Supabase to persist.'); return; }
    setStatus('saving');

    const input: ProductInput = {
      ...parsed.data,
      brand: parsed.data.brand || null,
      compare_at_price: parsed.data.compare_at_price ?? null,
      category_id: parsed.data.category_id || null,
      currency,
      images,
      faqs: product?.faqs ?? [],
      rating: product?.rating ?? null,
      review_count: product?.review_count ?? 0,
    };
    const sb = supabaseBrowser();
    const { error } = product
      ? await sb.from('products').update(input).eq('id', product.id)
      : await sb.from('products').insert(input);

    if (error) { setStatus('error'); setMessage(error.message); return; }
    setStatus('saved');
    if (!product) window.location.assign('/admin/products');
  }

  const field = (name: string, label: string, input: React.ReactNode) => (
    <label className="fieldset">
      <span className="label">{label}</span>
      {input}
      {errors[name] && <span className="text-error text-xs">{errors[name]}</span>}
    </label>
  );

  return (
    <form onSubmit={onSubmit} className="grid gap-4 md:grid-cols-2">
      {field('title', 'Title', <input name="title" defaultValue={product?.title} className="input w-full" required />)}
      {field('slug', 'Slug', <input name="slug" defaultValue={product?.slug} className="input w-full" required />)}
      {field('sku', 'SKU', <input name="sku" defaultValue={product?.sku} className="input w-full" required />)}
      {field('brand', 'Brand', <input name="brand" defaultValue={product?.brand ?? ''} className="input w-full" />)}
      {field('price', `Price (${currency})`, <input name="price" type="number" step="0.01" defaultValue={product?.price} className="input w-full" required />)}
      {field('compare_at_price', 'Compare-at price', <input name="compare_at_price" type="number" step="0.01" defaultValue={product?.compare_at_price ?? ''} className="input w-full" />)}
      {field('stock', 'Stock', <input name="stock" type="number" defaultValue={product?.stock ?? 0} className="input w-full" required />)}
      {field('category_id', 'Category', (
        <select name="category_id" defaultValue={product?.category_id ?? ''} className="select w-full">
          <option value="">— none —</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      ))}
      <div className="md:col-span-2">
        {field('description', 'Description', <textarea name="description" defaultValue={product?.description} rows={5} className="textarea w-full" required />)}
      </div>
      <div className="md:col-span-2">
        {field('attributes', 'Attributes (JSON, e.g. {"color":"red","size":"M"})', (
          <textarea name="attributes" defaultValue={JSON.stringify(product?.attributes ?? {}, null, 2)} rows={4} className="textarea w-full font-mono text-sm" />
        ))}
      </div>
      <div className="md:col-span-2">
        <span className="label">Media</span>
        <MediaUploader value={images} onChange={setImages} />
      </div>
      <label className="label cursor-pointer gap-2 md:col-span-2">
        <input type="checkbox" name="is_active" defaultChecked={product?.is_active ?? true} className="toggle toggle-primary" />
        Visible in storefront
      </label>
      <div className="md:col-span-2 flex items-center gap-3">
        <button className="btn btn-primary" disabled={status === 'saving'}>
          {status === 'saving' && <span className="loading loading-spinner loading-xs" />}
          {product ? 'Save changes' : 'Create product'}
        </button>
        {status === 'saved' && <span className="text-success text-sm">Saved</span>}
        {status === 'error' && <span className="text-error text-sm">{message}</span>}
      </div>
    </form>
  );
}
