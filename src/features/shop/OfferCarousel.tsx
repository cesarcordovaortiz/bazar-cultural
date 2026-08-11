import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Campaign, Product } from '../../types';

interface Props { campaigns: Campaign[]; products: Product[]; }

const ROTATION_INTERVAL_MS = 6_000;

export function OfferCarousel({ campaigns, products }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const activeOffer = campaigns[activeIndex % campaigns.length];
  const activeProducts = useMemo(() => activeOffer ? products.filter((product) => activeOffer.productIds.includes(product.id)) : [], [activeOffer, products]);
  const primaryProduct = activeProducts[0];
  const shouldAutoAdvance = campaigns.length > 1 && isPlaying && !isHovered && !isFocused && !prefersReducedMotion;

  useEffect(() => {
    setActiveIndex((current) => campaigns.length ? current % campaigns.length : 0);
  }, [campaigns.length]);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updatePreference = (): void => setPrefersReducedMotion(mediaQuery.matches);
    updatePreference();
    mediaQuery.addEventListener('change', updatePreference);
    return () => mediaQuery.removeEventListener('change', updatePreference);
  }, []);

  useEffect(() => {
    if (!shouldAutoAdvance) return undefined;
    const timer = window.setInterval(() => setActiveIndex((current) => (current + 1) % campaigns.length), ROTATION_INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [campaigns.length, shouldAutoAdvance]);

  if (!activeOffer) return null;

  const showPrevious = (): void => setActiveIndex((current) => (current - 1 + campaigns.length) % campaigns.length);
  const showNext = (): void => setActiveIndex((current) => (current + 1) % campaigns.length);

  return (
    <section aria-label="Ofertas vigentes" aria-roledescription="carrusel" onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)} onFocusCapture={() => setIsFocused(true)} onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setIsFocused(false); }} className="mb-8 overflow-hidden rounded-3xl border border-orange-400 bg-stone-950 text-white shadow-xl shadow-orange-950/20">
      <div className="grid lg:grid-cols-[1.05fr_0.95fr]">
        <article key={activeOffer.id} className="relative overflow-hidden p-6 sm:p-8">
          <div aria-hidden="true" className="absolute -left-12 -top-16 size-56 rounded-full border-[18px] border-orange-400/20" />
          <div className="relative"><div className="flex flex-wrap items-center gap-3"><span className="rounded-full bg-orange-500 px-3 py-1 text-xs font-bold uppercase tracking-wider text-stone-950">Oferta por tiempo limitado</span><span className="text-sm font-semibold text-amber-200">Oferta {activeIndex % campaigns.length + 1} de {campaigns.length}</span></div>
            <h2 className="mt-5 text-3xl font-semibold text-white sm:text-4xl">{activeOffer.name}</h2>
            <p className="mt-3 max-w-2xl text-base leading-7 text-stone-200">{activeOffer.discountPercent ? `Aprovecha ${activeOffer.discountPercent}% de descuento en una selección cultural antes del ${new Date(activeOffer.endAt).toLocaleDateString()}.` : `Descubre esta selección especial antes del ${new Date(activeOffer.endAt).toLocaleDateString()}.`}</p>
            {activeProducts.length > 0 && <div className="mt-6 flex flex-wrap gap-2">{activeProducts.map((product) => <span key={product.id} className="rounded-full border border-orange-300/40 bg-white/10 px-3 py-2 text-sm font-semibold text-white">{product.name}</span>)}</div>}
            {primaryProduct && <Link to={`/products/${primaryProduct.id}`} className="mt-7 inline-flex items-center justify-center rounded-2xl bg-amber-300 px-5 py-3 text-sm font-bold text-stone-950 shadow-lg shadow-black/20 transition-all duration-200 hover:bg-amber-200 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">Ver productos con oferta antes de que termine <span aria-hidden="true" className="ml-2">→</span></Link>}
          </div>
        </article>
        <div className="relative min-h-72 overflow-hidden border-t border-orange-400/30 bg-gradient-to-br from-orange-600 via-orange-700 to-red-800 lg:border-l lg:border-t-0">
          {primaryProduct ? <img key={primaryProduct.id} src={primaryProduct.image} alt="" aria-hidden="true" width="640" height="640" className="absolute inset-0 h-full w-full object-cover opacity-75 transition-opacity duration-500" /> : <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,#fbbf24,transparent_30%),radial-gradient(circle_at_80%_70%,#ea580c,transparent_35%)]" />}
          <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/45 to-transparent" />
          <div className="relative flex h-full min-h-72 flex-col justify-between p-6 sm:p-8"><div><p className="text-sm font-semibold uppercase tracking-wider text-amber-200">No dejes pasar la oportunidad</p><p className="mt-3 max-w-sm text-2xl font-semibold text-white">La cultura se comparte, las ofertas no esperan.</p><p className="mt-3 max-w-sm text-sm leading-6 text-stone-100">{primaryProduct ? `Destacado: ${primaryProduct.name}` : 'Explora la selección cultural vigente.'}</p></div>
            {campaigns.length > 1 && <div className="flex flex-col gap-4"><div className="flex gap-2" aria-label="Seleccionar oferta">{campaigns.map((campaign, index) => <button key={campaign.id} type="button" aria-label={`Mostrar oferta ${index + 1}: ${campaign.name}`} aria-current={index === activeIndex % campaigns.length} onClick={() => setActiveIndex(index)} className={index === activeIndex % campaigns.length ? 'h-3 w-9 rounded-full bg-amber-300 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white' : 'h-3 w-3 rounded-full bg-white/60 transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white'} />)}</div><div className="flex flex-wrap gap-2"><button type="button" onClick={showPrevious} aria-label="Oferta anterior" className="rounded-xl border border-white/60 bg-stone-950/40 px-3 py-2 text-sm font-semibold text-white transition hover:bg-stone-950/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">Anterior</button><button type="button" onClick={showNext} aria-label="Siguiente oferta" className="rounded-xl bg-white px-3 py-2 text-sm font-bold text-orange-900 transition hover:bg-amber-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">Siguiente</button><button type="button" onClick={() => setIsPlaying((current) => !current)} className="rounded-xl border border-amber-200/80 px-3 py-2 text-sm font-semibold text-amber-100 transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">{isPlaying ? 'Pausar carrusel' : 'Reanudar carrusel'}</button></div></div>}
          </div>
        </div>
      </div>
    </section>
  );
}
