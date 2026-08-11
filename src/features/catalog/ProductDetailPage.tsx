import { Link, useParams } from 'react-router-dom';
import { useCart } from '../cart/CartContext';
import { useProducts } from './useProducts';
import { getProductPricing } from '../../lib/pricing';

export function ProductDetailPage() {
  const { productId } = useParams<{ productId: string }>();
  const { addProduct, activeCampaigns } = useCart();
  const { data: products = [], isLoading } = useProducts();
  const product = products.find((item) => item.id === productId);
  const pricing = product ? getProductPricing(product, activeCampaigns) : null;

  if (isLoading) return <main className="mx-auto max-w-5xl px-4 py-12"><div className="h-80 animate-pulse rounded-3xl bg-slate-200" /></main>;
  if (!product) return <main className="mx-auto max-w-5xl px-4 py-12"><section className="rounded-3xl bg-white p-8 text-center shadow-sm ring-1 ring-slate-200"><h1 className="text-2xl font-semibold text-slate-950">Producto no encontrado</h1><Link to="/" className="mt-4 inline-flex text-sm font-semibold text-slate-700 underline underline-offset-4">Volver al catálogo</Link></section></main>;

  return (
    <main className="mx-auto max-w-5xl px-4 py-12">
      <article className="grid gap-8 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 md:grid-cols-[0.9fr_1.1fr] md:p-8">
        <div className="aspect-square overflow-hidden rounded-3xl bg-orange-100"><img src={product.image} alt={`Imagen de ${product.name}`} width="640" height="640" className="h-full w-full object-cover" /></div>
        <div className="flex flex-col items-start">
          <Link to="/" className="text-sm font-semibold text-slate-600 underline underline-offset-4">Volver al catálogo</Link>
          <p className="mt-6 text-sm font-medium uppercase tracking-wider text-slate-500">{product.type}</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-950">{product.name}</h1>
          <p className="mt-4 leading-7 text-slate-600">{product.description}</p>
          <div className="mt-5 flex flex-wrap gap-2">{product.tags.map((tag) => <span key={tag} className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700">{tag}</span>)}</div>
          <div className="mt-8"><p className="text-3xl font-semibold text-slate-950">${pricing?.finalPrice.toFixed(2)}</p>{pricing?.campaign && <><p className="mt-1 text-sm font-semibold text-orange-800">{pricing.discountPercent}% de descuento · {pricing.campaign.name}</p><p className="mt-1 text-sm text-slate-500 line-through">Precio habitual: ${pricing.originalPrice.toFixed(2)}</p></>}</div>
          <p className="mt-2 text-sm text-slate-600">{product.inventory} unidades disponibles</p>
          <button type="button" disabled={product.inventory === 0} onClick={() => addProduct(product)} className="mt-6 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition-all duration-200 hover:bg-slate-800 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500">{product.inventory === 0 ? 'Agotado' : 'Añadir al carrito'}</button>
        </div>
      </article>
    </main>
  );
}
