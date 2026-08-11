import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../cart/CartContext';
import { useProducts } from '../catalog/useProducts';
import { getProductPricing } from '../../lib/pricing';
import { formatCurrency, PRODUCT_TYPE_OPTIONS } from '../../lib/presentation';
import { useActiveCampaigns } from '../campaigns/useActiveCampaigns';
import { useCurrency } from '../currency/CurrencyContext';
import type { ProductType } from '../../types';

const PRODUCT_TYPES: Array<{ value: ProductType | 'all'; label: string }> = [{ value: 'all', label: 'Todos' }, ...PRODUCT_TYPE_OPTIONS];

export function ShopPage() {
  const { addProduct, items, total } = useCart();
  const { data: products = [], isLoading } = useProducts();
  const [search, setSearch] = useState('');
  const [type, setType] = useState<ProductType | 'all'>('all');
  const [activeOfferIndex, setActiveOfferIndex] = useState(0);
  const activeCampaigns = useActiveCampaigns();
  const { currency, exchangeRate, exchangeRateError, formatAmount } = useCurrency();

  const itemCount = useMemo(() => items.reduce((sum, item) => sum + item.quantity, 0), [items]);
  const filteredProducts = useMemo(() => products.filter((product) => {
    const term = search.toLocaleLowerCase();
    return (type === 'all' || product.type === type) && [product.name, product.description, ...product.tags].some((value) => value.toLocaleLowerCase().includes(term));
  }), [products, search, type]);
  const activeOffer = activeCampaigns[activeOfferIndex % activeCampaigns.length];
  const activeOfferProducts = activeOffer ? products.filter((product) => activeOffer.productIds.includes(product.id)) : [];

  const showPreviousOffer = (): void => setActiveOfferIndex((current) => (current - 1 + activeCampaigns.length) % activeCampaigns.length);
  const showNextOffer = (): void => setActiveOfferIndex((current) => (current + 1) % activeCampaigns.length);

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <section className="relative mb-10 flex overflow-hidden flex-col gap-3 rounded-3xl bg-gradient-to-br from-orange-800 via-orange-700 to-amber-600 p-6 text-white shadow-xl shadow-orange-950/15 sm:p-8">
        <div aria-hidden="true" className="absolute -right-16 -top-20 h-52 w-52 rounded-full border-8 border-white/10" />
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative">
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-orange-100">Economía naranja</p>
            <h1 className="mt-2 text-3xl font-semibold sm:text-4xl">Tienda de experiencias</h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-orange-50 sm:text-base">Objetos, relatos y creaciones que conectan comunidades, memoria y trabajo cultural.</p>
          </div>
          <Link
            to="/cart"
            className="relative rounded-3xl border border-white/25 bg-white/10 px-5 py-4 text-white shadow-sm backdrop-blur transition-all duration-200 hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            <p className="text-xs uppercase tracking-[0.2em] text-orange-100">Carrito</p>
            <p className="text-xl font-semibold">{itemCount} artículos</p>
            <p className="text-sm text-orange-50">Total {formatAmount(total)}</p>
          </Link>
        </div>
      </section>

      <p className="mb-6 rounded-2xl border border-orange-200 bg-white/80 px-4 py-3 text-sm text-stone-700">Precios mostrados en <strong>{currency === 'BOB' ? 'bolivianos (Bs)' : 'dólares estadounidenses (USD)'}</strong>. 1 USD = {formatCurrency(exchangeRate.rate, 'BOB')} según el <a href={exchangeRate.source.url} target="_blank" rel="noreferrer" className="font-semibold text-orange-800 underline underline-offset-4">Banco Central de Bolivia</a>{exchangeRate.effectiveDate ? `, vigente desde el ${exchangeRate.effectiveDate}` : ''}.{exchangeRateError && ' Se muestra la última cotización disponible.'}</p>

      {activeOffer && <section aria-label="Ofertas vigentes" aria-roledescription="carrusel" className="mb-6 overflow-hidden rounded-3xl border border-orange-200 bg-orange-100/70 shadow-sm">
        <div className="grid lg:grid-cols-[1.25fr_0.75fr]">
          <article key={activeOffer.id} className="p-6 sm:p-8">
            <div className="flex items-center gap-3"><span className="rounded-full bg-orange-700 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white">Oferta por tiempo limitado</span><span className="text-sm font-semibold text-orange-800">Oferta {activeOfferIndex % activeCampaigns.length + 1} de {activeCampaigns.length}</span></div>
            <h2 className="mt-5 text-3xl font-semibold text-stone-950 sm:text-4xl">{activeOffer.name}</h2>
            <p className="mt-3 max-w-2xl text-base leading-7 text-stone-700">{activeOffer.discountPercent ? `Aprovecha ${activeOffer.discountPercent}% de descuento en una selección cultural antes del ${new Date(activeOffer.endAt).toLocaleDateString()}.` : `Descubre esta selección especial antes del ${new Date(activeOffer.endAt).toLocaleDateString()}.`}</p>
            {activeOfferProducts.length > 0 && <div className="mt-6 flex flex-wrap gap-2">{activeOfferProducts.map((product) => <span key={product.id} className="rounded-full border border-orange-300 bg-white/80 px-3 py-2 text-sm font-semibold text-stone-700">{product.name}</span>)}</div>}
            {activeOfferProducts[0] && <Link to={`/products/${activeOfferProducts[0].id}`} className="mt-7 inline-flex items-center justify-center rounded-2xl bg-orange-700 px-5 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-orange-800 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-600">Ver productos con oferta antes de que termine</Link>}
          </article>
          <div className="flex flex-col justify-between bg-orange-700 p-6 text-white sm:p-8">
            <div><p className="text-sm font-semibold uppercase tracking-wider text-orange-100">No dejes pasar la oportunidad</p><p className="mt-3 text-2xl font-semibold">La cultura se comparte, las ofertas no esperan.</p><p className="mt-4 text-sm leading-6 text-orange-100">Explora la selección de esta campaña y añade tus favoritos al carrito mientras esté vigente.</p></div>
            {activeCampaigns.length > 1 && <div className="mt-8 flex items-center justify-between gap-4"><div className="flex gap-2" aria-label="Seleccionar oferta">{activeCampaigns.map((campaign, index) => <button key={campaign.id} type="button" aria-label={`Mostrar oferta ${index + 1}: ${campaign.name}`} aria-current={index === activeOfferIndex % activeCampaigns.length} onClick={() => setActiveOfferIndex(index)} className={index === activeOfferIndex % activeCampaigns.length ? 'h-3 w-8 rounded-full bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white' : 'h-3 w-3 rounded-full bg-orange-300 transition hover:bg-orange-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white'} />)}</div><div className="flex gap-2"><button type="button" onClick={showPreviousOffer} aria-label="Oferta anterior" className="rounded-xl border border-white/40 px-3 py-2 text-sm font-semibold transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">Anterior</button><button type="button" onClick={showNextOffer} aria-label="Siguiente oferta" className="rounded-xl bg-white px-3 py-2 text-sm font-semibold text-orange-800 transition hover:bg-orange-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">Siguiente</button></div></div>}
          </div>
        </div>
      </section>}

      <section aria-label="Filtros del catálogo" className="cultural-surface mb-6 rounded-3xl p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <label className="text-sm font-semibold text-stone-700">Buscar productos<input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Título, descripción o etiqueta" className="mt-2 block w-full rounded-2xl border border-orange-200 bg-orange-50 px-4 py-3 text-stone-900 placeholder:text-stone-500 sm:w-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-600" /></label>
          <div className="flex flex-wrap gap-2">{PRODUCT_TYPES.map((item) => <button key={item.value} type="button" aria-pressed={type === item.value} onClick={() => setType(item.value)} className={type === item.value ? 'rounded-full bg-orange-700 px-3 py-2 text-sm font-semibold text-white shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-600' : 'rounded-full bg-orange-100 px-3 py-2 text-sm font-semibold text-stone-700 transition hover:bg-orange-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-600'}>{item.label}</button>)}</div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        {isLoading ? Array.from({ length: 3 }, (_, index) => <div key={index} className="h-64 animate-pulse rounded-3xl bg-slate-200" />) : filteredProducts.map((product) => {
          const pricing = getProductPricing(product, activeCampaigns);
          return (
          <article key={product.id} className="cultural-surface rounded-3xl p-6 transition hover:-translate-y-0.5 hover:shadow-lg">
            <div className="mb-5 aspect-square overflow-hidden rounded-2xl bg-orange-100">
              <img src={product.image} alt={`Imagen de ${product.name}`} width="640" height="640" loading="lazy" decoding="async" className="h-full w-full object-cover transition duration-300 hover:scale-105" />
            </div>
            <div className="mb-4 flex items-center justify-between gap-2">
              <h2 className="text-xl font-semibold text-slate-950">{product.name}</h2>
              <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-800">{product.currency}</span>
            </div>
            {product.fulfillmentType === 'digital' && <p className="mb-3 inline-flex rounded-full bg-sky-100 px-3 py-1 text-xs font-bold text-sky-800">Entrega digital con seguimiento</p>}
            {pricing.campaign && <p className="mb-3 inline-flex rounded-full bg-orange-100 px-3 py-1 text-xs font-bold text-orange-800">{pricing.discountPercent}% de descuento · {pricing.campaign.name}</p>}
            <p className="mb-5 text-sm leading-6 text-slate-600">{product.description}</p>
            <Link to={`/products/${product.id}`} className="mb-5 inline-flex text-sm font-semibold text-orange-800 underline underline-offset-4 transition hover:text-orange-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-600">Ver detalle</Link>
            <div className="flex items-center justify-between gap-3">
              <span className="flex flex-col"><span className="text-2xl font-semibold text-slate-900">{formatAmount(pricing.finalPrice, product.currency)}</span>{pricing.campaign && <span className="text-sm text-stone-500 line-through">{formatAmount(pricing.originalPrice, product.currency)}</span>}</span>
              <button
                type="button"
                onClick={() => addProduct(product)}
                disabled={product.inventory === 0}
                className="rounded-2xl bg-orange-700 px-4 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-orange-800 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-stone-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-600"
              >
                {product.inventory === 0 ? 'Agotado' : 'Añadir'}
              </button>
            </div>
          </article>
          );
        })}
        {!isLoading && filteredProducts.length === 0 && <p className="col-span-full rounded-3xl bg-white p-8 text-center text-slate-600 shadow-sm ring-1 ring-slate-200">No encontramos productos con esos filtros.</p>}
      </section>
    </main>
  );
}
