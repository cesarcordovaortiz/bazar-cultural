import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { deleteCampaign, readCampaigns, saveCampaign, subscribeCampaigns } from '../../lib/campaignStore';
import { products } from '../../lib/products';
import type { Campaign } from '../../types';

interface CampaignFormValues {
  name: string;
  discountPercent: number;
  productId: string;
  endDate: string;
}

export function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const { register, handleSubmit, reset } = useForm<CampaignFormValues>({ defaultValues: { name: '', discountPercent: 10, productId: products[0]?.id ?? '', endDate: '' } });

  useEffect(() => {
    const refresh = (): void => setCampaigns(readCampaigns());
    refresh();
    return subscribeCampaigns(refresh);
  }, []);

  const activeCount = useMemo(() => campaigns.filter((campaign) => campaign.active && campaign.endAt > Date.now()).length, [campaigns]);

  const onSubmit = (values: CampaignFormValues): void => {
    const endAt = values.endDate ? new Date(values.endDate).getTime() : Date.now() + 30 * 86_400_000;
    saveCampaign({ id: `campaign-${Date.now()}`, name: values.name, productIds: [values.productId], startAt: Date.now(), endAt, discountPercent: values.discountPercent, active: true });
    reset();
  };

  return (
    <main className="mx-auto max-w-6xl px-4 py-12">
      <div className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
        <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 sm:p-8">
          <p className="text-sm font-medium uppercase tracking-wider text-slate-500">Administración</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-950">Campañas culturales</h1>
          <p className="mt-3 text-slate-600">Crea descuentos temporales para productos del catálogo.</p>
          <div className="mt-8 space-y-4">
            {campaigns.map((campaign) => (
              <article key={campaign.id} className="flex flex-col gap-4 rounded-2xl border border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center gap-2"><h2 className="font-semibold text-slate-950">{campaign.name}</h2><span className={campaign.active ? 'rounded-full bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-800' : 'rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700'}>{campaign.active ? 'Activa' : 'Inactiva'}</span></div>
                  <p className="mt-1 text-sm text-slate-600">{campaign.discountPercent ?? 0}% de descuento · hasta {new Date(campaign.endAt).toLocaleDateString()}</p>
                </div>
                <div className="flex gap-3">
                  <button type="button" onClick={() => saveCampaign({ ...campaign, active: !campaign.active })} className="rounded-xl border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500">{campaign.active ? 'Pausar' : 'Activar'}</button>
                  <button type="button" onClick={() => deleteCampaign(campaign.id)} className="rounded-xl px-3 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400">Eliminar</button>
                </div>
              </article>
            ))}
          </div>
        </section>
        <aside className="space-y-6">
          <section className="rounded-3xl bg-slate-950 p-6 text-white"><p className="text-sm text-slate-300">KPI campañas activas</p><p className="mt-2 text-4xl font-semibold">{activeCount}</p><p className="mt-3 text-sm text-slate-300">Los datos son simulados hasta conectar la API de analítica.</p></section>
          <form onSubmit={handleSubmit(onSubmit)} className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <h2 className="text-xl font-semibold text-slate-950">Nueva campaña</h2>
            <div className="mt-5 space-y-4">
              <label className="block text-sm text-slate-700">Nombre<input {...register('name', { required: true })} className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500" /></label>
              <label className="block text-sm text-slate-700">Producto<select {...register('productId')} className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500">{products.map((product) => <option key={product.id} value={product.id}>{product.name}</option>)}</select></label>
              <label className="block text-sm text-slate-700">Descuento (%)<input {...register('discountPercent', { valueAsNumber: true, min: 1, max: 100 })} type="number" className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500" /></label>
              <label className="block text-sm text-slate-700">Fecha de fin<input {...register('endDate')} type="date" className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500" /></label>
              <button className="w-full rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500">Crear campaña</button>
            </div>
          </form>
        </aside>
      </div>
    </main>
  );
}
