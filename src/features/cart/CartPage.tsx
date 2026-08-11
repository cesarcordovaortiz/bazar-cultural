import { Link } from 'react-router-dom';
import { useCart } from './CartContext';
import { getProductPricing } from '../../lib/pricing';
import { useCurrency } from '../currency/CurrencyContext';

export function CartPage() {
  const { items, removeProduct, total, subtotal, discount, activeCampaigns, updateQuantity } = useCart();
  const { formatAmount } = useCurrency();

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
              {items.map(({ product, quantity }) => {
                const pricing = getProductPricing(product, activeCampaigns);
                return (
                <article key={product.id} className="flex flex-col gap-4 rounded-3xl border border-orange-100 p-5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-4">
                    <img src={product.image} alt="" width="64" height="64" loading="lazy" decoding="async" className="h-16 w-16 rounded-2xl object-cover" />
                    <div>
                      <h2 className="font-semibold text-slate-950">{product.name}</h2>
                      <p className="mt-1 text-sm text-slate-600">{formatAmount(pricing.finalPrice, product.currency)} por unidad</p>
                      {pricing.campaign && <p className="mt-1 text-xs font-semibold text-orange-800">{pricing.discountPercent}% de descuento · {pricing.campaign.name}</p>}
                      {pricing.campaign && <p className="mt-1 text-xs text-stone-500 line-through">{formatAmount(pricing.originalPrice, product.currency)} habitual</p>}
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
                    <span className="w-24 text-right font-semibold text-slate-950">{formatAmount(pricing.finalPrice * quantity, product.currency)}</span>
                    <button type="button" onClick={() => removeProduct(product.id)} className="text-sm font-semibold text-rose-700 underline underline-offset-4 transition hover:text-rose-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400">
                      Quitar
                    </button>
                  </div>
                </article>
                );
              })}
            </section>
            <aside className="h-fit rounded-3xl bg-slate-950 p-6 text-white" aria-label="Resumen del carrito">
              <dl className="space-y-3 text-sm">
                <div className="flex items-center justify-between gap-4"><dt className="text-slate-300">Subtotal</dt><dd className="font-semibold">{formatAmount(subtotal)}</dd></div>
                {discount > 0 && <div className="flex items-center justify-between gap-4 text-orange-200"><dt>Descuento de campañas</dt><dd className="font-semibold">−{formatAmount(discount)}</dd></div>}
                <div className="border-t border-white/20 pt-3"><dt className="text-sm text-slate-300">Total</dt><dd className="mt-1 text-3xl font-semibold">{formatAmount(total)}</dd></div>
              </dl>
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
