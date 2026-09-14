import { ShoppingCart } from 'lucide-react';
import { useState } from 'react';
import { addToCart } from '../../stores/cart';
import type { Product } from '../../types/ecom';

interface Props {
  product: Pick<Product, 'id' | 'slug' | 'title' | 'price' | 'images' | 'stock'>;
  size?: 'sm' | 'md';
}

export default function AddToCart({ product, size = 'md' }: Props) {
  const [added, setAdded] = useState(false);
  const out = product.stock <= 0;

  function onClick() {
    addToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  return (
    <button onClick={onClick} disabled={out} className={`btn btn-primary btn-block ${size === 'sm' ? 'btn-sm' : ''}`} data-testid="add-to-cart">
      <ShoppingCart size={size === 'sm' ? 14 : 18} />
      {out ? 'Out of stock' : added ? 'Added ✓' : 'Add to cart'}
    </button>
  );
}
