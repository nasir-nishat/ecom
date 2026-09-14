import { persistentAtom } from '@nanostores/persistent';
import { computed } from 'nanostores';
import type { CartItem, Product } from '../types/ecom';

/** Cart lives in localStorage and is shared across all React islands on the page. */
export const $cart = persistentAtom<CartItem[]>('cart', [], {
  encode: JSON.stringify,
  decode: JSON.parse,
});

export const $cartCount = computed($cart, (items) => items.reduce((n, i) => n + i.qty, 0));
export const $cartTotal = computed($cart, (items) => items.reduce((n, i) => n + i.qty * i.price, 0));

export function addToCart(p: Pick<Product, 'id' | 'slug' | 'title' | 'price' | 'images'>, qty = 1) {
  const items = $cart.get();
  const existing = items.find((i) => i.productId === p.id);
  if (existing) {
    $cart.set(items.map((i) => (i.productId === p.id ? { ...i, qty: i.qty + qty } : i)));
    return;
  }
  $cart.set([...items, { productId: p.id, slug: p.slug, title: p.title, price: p.price, image: p.images[0] ?? null, qty }]);
}

export function setQty(productId: string, qty: number) {
  $cart.set(qty <= 0 ? $cart.get().filter((i) => i.productId !== productId) : $cart.get().map((i) => (i.productId === productId ? { ...i, qty } : i)));
}

export const clearCart = () => $cart.set([]);
