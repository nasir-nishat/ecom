/** Mirrors supabase/schema.sql. Regenerate with `supabase gen types` once the schema stabilises. */

export type Availability = 'InStock' | 'OutOfStock' | 'PreOrder';

export interface Category {
  id: string;
  slug: string;
  name: string;
  parent_id: string | null;
}

export interface Product {
  id: string;
  slug: string;
  title: string;
  description: string;
  sku: string;
  brand: string | null;
  price: number;
  compare_at_price: number | null;
  currency: string;
  stock: number;
  /** Aggregate rating 0–5 (null = no ratings yet) and number of ratings. */
  rating: number | null;
  review_count: number;
  images: string[];
  /** Free-form machine-readable attributes (color, size, material, …). */
  attributes: Record<string, string | number | boolean>;
  faqs: Faq[];
  category_id: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Faq {
  question: string;
  answer: string;
}

export type ProductInput = Omit<Product, 'id' | 'created_at' | 'updated_at'>;

export interface CartItem {
  productId: string;
  slug: string;
  title: string;
  price: number;
  image: string | null;
  qty: number;
}

export interface Inquiry {
  name: string;
  email: string;
  message: string;
  product_id?: string | null;
}

export interface Profile {
  id: string;
  email: string;
  is_admin: boolean;
}
