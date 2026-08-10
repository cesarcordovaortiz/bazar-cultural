import { Link } from 'react-router-dom';
import { useCart } from './CartContext';

export function CartPage() {
  const { items, removeProduct, total, updateQuantity } = useCart();

  return (
    <main className="mx-auto max-w-5xl px-4 py-12">
      <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-slate-950">Carrito</h1>
            <p className="mt-2 text-slate-600">Revisa tus productos antes de confirmar el pedido.</p>
          </div>
          <Link to="/" className="text-sm font-semibold text-slate-700 underline underline-offset-4 transition hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500">
            Seguir comprando
          </Link>
        </div>

        {items.length === 0 ? (
          <div className="mt-8 rounded-3xl bg-slate-50 p-8 text-center">
            <p className="text-slate-600">Tu carrito está vacío.</p>
            <Link to="/" className="mt-4 inline-flex rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition-all duration-200 hover:bg-slate-800 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500">
              Ver catálogo
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_18rem]">
            <section className="space-y-3" aria-label="Productos del carrito">
              {items.map(({ product, quantity }) => (
                <article key={product.id} className="flex flex-col gap-4 rounded-3xl border border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-4">
                    <img src={product.image} alt="" width="64" height="64" loading="lazy" decoding="async" className="h-16 w-16 rounded-2xl object-cover" />
                    <div>
                      <h2 className="font-semibold text-slate-950">{product.name}</h2>
                      <p className="mt-1 text-sm text-slate-600">${product.price.toFixed(2)} por unidad</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <label className="sr-only" htmlFor={`quantity-${product.id}`}>Cantidad de {product.name}</label>
                    <input
                      id={`quantity-${product.id}`}
                      min="1"
                      max={product.inventory}
                      type="number"
                      value={quantity}
                      onChange={(event) => updateQuantity(product.id, Math.min(product.inventory, Number(event.target.value) || 0))}
                      className="w-20 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-center text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500"
                    />
                    <span className="w-20 text-right font-semibold text-slate-950">${(product.price * quantity).toFixed(2)}</span>
                    <button type="button" onClick={() => removeProduct(product.id)} className="text-sm font-semibold text-rose-700 underline underline-offset-4 transition hover:text-rose-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400">
                      Quitar
                    </button>
                  </div>
                </article>
              ))}
            </section>
            <aside className="h-fit rounded-3xl bg-slate-950 p-6 text-white">
              <p className="text-sm text-slate-300">Total</p>
              <p className="mt-2 text-3xl font-semibold">${total.toFixed(2)}</p>
              <Link to="/checkout" className="mt-6 inline-flex w-full justify-center rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-950 transition-all duration-200 hover:bg-slate-100 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">
                Ir al checkout
              </Link>
            </aside>
          </div>
        )}
      </div>
    </main>
  );
}
