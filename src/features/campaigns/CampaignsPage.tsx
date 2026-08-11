import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { deleteCampaign, readCampaigns, saveCampaign, subscribeCampaigns } from '../../lib/campaignStore';
import { products } from '../../lib/products';
import type { Campaign } from '../../types';

interface CampaignFormValues {
  name: string;
  discountPercent: number;
  productIds: string[];
  startDate: string;
  endDate: string;
}

function toDateTimeLocalValue(timestamp: number): string {
  const localTimestamp = timestamp - new Date(timestamp).getTimezoneOffset() * 60_000;
  return new Date(localTimestamp).toISOString().slice(0, 16);
}

function getDefaultValues(): CampaignFormValues {
  const now = Date.now();
  return {
    name: '',
    discountPercent: 10,
    productIds: products[0] ? [products[0].id] : [],
    startDate: toDateTimeLocalValue(now),
    endDate: toDateTimeLocalValue(now + 30 * 86_400_000),
  };
}

function getCampaignStatus(campaign: Campaign): { label: string; className: string } {
  const now = Date.now();
  if (!campaign.active) return { label: 'Inactiva', className: 'bg-slate-100 text-slate-700' };
  if (campaign.startAt > now) return { label: 'Programada', className: 'bg-sky-100 text-sky-800' };
  if (campaign.endAt <= now) return { label: 'Finalizada', className: 'bg-stone-100 text-stone-700' };
  return { label: 'Activa', className: 'bg-emerald-100 text-emerald-800' };
}

export function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const { register, handleSubmit, reset, getValues, formState: { errors } } = useForm<CampaignFormValues>({ defaultValues: getDefaultValues() });

  useEffect(() => {
    const refresh = (): void => setCampaigns(readCampaigns());
    refresh();
    return subscribeCampaigns(refresh);
  }, []);

  const activeCount = useMemo(() => campaigns.filter((campaign) => campaign.active && campaign.startAt <= Date.now() && campaign.endAt > Date.now()).length, [campaigns]);

  const onSubmit = (values: CampaignFormValues): void => {
    saveCampaign({ id: `campaign-${Date.now()}`, name: values.name.trim(), productIds: values.productIds, startAt: new Date(values.startDate).getTime(), endAt: new Date(values.endDate).getTime(), discountPercent: values.discountPercent, active: true });
    reset(getDefaultValues());
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
              <article key={campaign.id} className="flex flex-col gap-4 rounded-2xl border border-orange-100 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center gap-2"><h2 className="font-semibold text-slate-950">{campaign.name}</h2><span className={`rounded-full px-2 py-1 text-xs font-semibold ${getCampaignStatus(campaign).className}`}>{getCampaignStatus(campaign).label}</span></div>
                  <p className="mt-1 text-sm text-slate-600">{campaign.discountPercent ?? 0}% de descuento · del {new Date(campaign.startAt).toLocaleDateString()} al {new Date(campaign.endAt).toLocaleDateString()}</p>
                  <p className="mt-1 text-sm text-slate-600">{campaign.productIds.length} {campaign.productIds.length === 1 ? 'producto incluido' : 'productos incluidos'}</p>
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
          <form noValidate onSubmit={handleSubmit(onSubmit)} className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <h2 className="text-xl font-semibold text-slate-950">Nueva campaña</h2>
            <div className="mt-5 space-y-4">
              <label className="block text-sm text-slate-700">Nombre<input {...register('name', { required: 'Indica un nombre para la campaña' })} aria-invalid={Boolean(errors.name)} className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-600" /></label>
              {errors.name && <p role="alert" className="text-sm font-medium text-rose-700">{errors.name.message}</p>}
              <fieldset><legend className="text-sm text-slate-700">Productos incluidos</legend><p className="mt-1 text-xs text-slate-500">Selecciona uno o más productos a los que se aplicará el descuento.</p><div className="mt-3 grid max-h-52 grid-cols-1 gap-2 overflow-y-auto rounded-xl border border-slate-200 p-3">{products.map((product) => <label key={product.id} className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-1 text-sm text-slate-700 hover:bg-orange-50"><input type="checkbox" value={product.id} {...register('productIds', { validate: (value) => value?.length > 0 || 'Selecciona al menos un producto' })} className="h-4 w-4 rounded border-slate-300 text-orange-700 focus:ring-orange-600" />{product.name}</label>)}</div></fieldset>
              {errors.productIds && <p role="alert" className="text-sm font-medium text-rose-700">{errors.productIds.message}</p>}
              <label className="block text-sm text-slate-700">Descuento (%)<input {...register('discountPercent', { valueAsNumber: true, required: 'Indica el descuento', min: { value: 1, message: 'El descuento debe ser al menos 1%' }, max: { value: 100, message: 'El descuento no puede superar 100%' } })} aria-invalid={Boolean(errors.discountPercent)} type="number" className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-600" /></label>
              {errors.discountPercent && <p role="alert" className="text-sm font-medium text-rose-700">{errors.discountPercent.message}</p>}
              <div className="grid gap-4 sm:grid-cols-2"><label className="block text-sm text-slate-700">Inicio<input {...register('startDate', { required: 'Indica la fecha de inicio' })} aria-invalid={Boolean(errors.startDate)} type="datetime-local" className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-600" /></label><label className="block text-sm text-slate-700">Fin<input {...register('endDate', { required: 'Indica la fecha de fin', validate: (endDate) => new Date(endDate).getTime() > new Date(getValues('startDate')).getTime() || 'La fecha de fin debe ser posterior al inicio' })} aria-invalid={Boolean(errors.endDate)} type="datetime-local" className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-600" /></label></div>
              {(errors.startDate || errors.endDate) && <p role="alert" className="text-sm font-medium text-rose-700">{errors.startDate?.message ?? errors.endDate?.message}</p>}
              <button type="submit" className="w-full rounded-xl bg-orange-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-orange-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-600">Crear campaña</button>
            </div>
          </form>
        </aside>
      </div>
    </main>
  );
}
