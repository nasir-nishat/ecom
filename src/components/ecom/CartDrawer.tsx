import { useStore } from '@nanostores/react';
import { ShoppingCart, Trash2 } from 'lucide-react';
import { $cart, $cartCount, $cartTotal, setQty } from '../../stores/cart';
import { formatPrice } from '../../lib/format';

/** daisyUI drawer holding the cart. Mounted once in <Header>; any island can call addToCart(). */
export default function CartDrawer() {
  const items = useStore($cart);
  const count = useStore($cartCount);
  const total = useStore($cartTotal);

  return (
    <div className="drawer drawer-end w-auto">
      <input id="cart-drawer" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content">
        <label htmlFor="cart-drawer" className="btn btn-ghost btn-sm indicator" aria-label="Open cart">
          <ShoppingCart size={18} />
          {count > 0 && <span className="badge badge-primary badge-xs indicator-item">{count}</span>}
        </label>
      </div>
      <div className="drawer-side z-40">
        <label htmlFor="cart-drawer" className="drawer-overlay" aria-label="Close cart" />
        <aside className="bg-base-100 min-h-full w-80 sm:w-96 p-4 flex flex-col gap-4">
          <h2 className="text-lg font-semibold">Your cart</h2>
          {items.length === 0 && <p className="opacity-60">Your cart is empty.</p>}
          <ul className="flex-1 space-y-3 overflow-y-auto">
            {items.map((i) => (
              <li key={i.productId} className="flex gap-3 items-center">
                {i.image ? <img src={i.image} alt="" className="size-14 rounded object-cover" /> : <div className="size-14 rounded bg-base-200" />}
                <div className="flex-1 min-w-0">
                  <a href={`/product/${i.slug}`} className="link link-hover font-medium line-clamp-1">{i.title}</a>
                  <p className="text-sm opacity-70">{formatPrice(i.price)}</p>
                </div>
                <input type="number" min={1} value={i.qty} onChange={(e) => setQty(i.productId, Number(e.target.value))} className="input input-bordered input-xs w-14" aria-label="Quantity" />
                <button onClick={() => setQty(i.productId, 0)} className="btn btn-ghost btn-xs" aria-label="Remove"><Trash2 size={14} /></button>
              </li>
            ))}
          </ul>
          <div className="border-t border-base-300 pt-3 flex items-center justify-between">
            <span className="font-semibold">Total</span>
            <span className="font-semibold">{formatPrice(total)}</span>
          </div>
          <a href="/checkout" className={`btn btn-primary ${items.length === 0 ? 'btn-disabled' : ''}`}>Checkout</a>
        </aside>
      </div>
    </div>
  );
}
