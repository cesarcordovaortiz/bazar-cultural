import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { getDigitalDeliveryStatusLabel } from '../../../lib/digitalDelivery';
import { getPhysicalDeliveryStatusLabel } from '../../../lib/physicalDelivery';
import { getOrderById } from '../../../lib/orderStore';
import type { Order } from '../../../types';
import { useAuth } from '../../auth/useAuth';
import { useCurrency } from '../../currency/CurrencyContext';

export function OrderConfirmationPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const { user } = useAuth();
  const { formatAmount } = useCurrency();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (!orderId) return;
    const currentOrder = getOrderById(orderId);
    if (!currentOrder || currentOrder.userId !== user?.id) {
      navigate('/orders', { replace: true });
      return;
    }
    setOrder(currentOrder);
  }, [navigate, orderId, user?.id]);

  if (!order) return null;

  const deliverySummary = order.physicalDelivery
    ? { title: 'Entrega a domicilio', detail: `${getPhysicalDeliveryStatusLabel(order.physicalDelivery.status)} · seguimiento ${order.physicalDelivery.trackingCode}`, tone: 'border-sky-200 bg-sky-50 text-sky-950' }
    : order.digitalDelivery
      ? { title: 'Entrega digital', detail: `${getDigitalDeliveryStatusLabel(order.digitalDelivery.status)} · seguimiento ${order.digitalDelivery.trackingCode}`, tone: 'border-orange-200 bg-orange-50 text-orange-950' }
      : { title: 'Pedido recibido', detail: 'El equipo revisará la preparación de tu pedido.', tone: 'border-slate-200 bg-slate-50 text-slate-900' };

  return (
    <main className="mx-auto max-w-3xl px-4 py-16">
      <section className="overflow-hidden rounded-3xl border border-orange-300 bg-white shadow-xl shadow-orange-950/10">
        <div className="relative bg-gradient-to-br from-stone-950 via-orange-900 to-orange-600 px-6 py-10 text-white sm:px-10"><div aria-hidden="true" className="absolute -right-12 -top-16 size-56 rounded-full border-[18px] border-amber-200/20" /><div className="relative"><div aria-hidden="true" className="grid size-14 place-items-center rounded-2xl bg-amber-300 text-3xl font-bold text-stone-950">✓</div><p className="mt-5 text-sm font-semibold uppercase tracking-[0.18em] text-amber-200">Compra registrada</p><h1 className="mt-2 text-3xl font-semibold sm:text-4xl">Pedido confirmado</h1><p className="mt-3 max-w-xl text-sm leading-6 text-orange-50 sm:text-base">Guardamos tu pedido y abrimos el seguimiento para que conozcas cada novedad de la preparación y entrega.</p></div></div>
        <div className="p-6 sm:p-10"><div className="flex flex-col gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-sm font-semibold text-slate-600">Número de pedido</p><p className="mt-1 break-all text-lg font-bold text-slate-950">{order.id}</p><p className="mt-1 text-sm text-slate-600">{new Date(order.createdAt).toLocaleString()}</p></div><div className="rounded-2xl bg-stone-950 px-5 py-3 text-right text-white"><p className="text-xs font-semibold uppercase tracking-wide text-orange-200">Total</p><p className="mt-1 text-2xl font-semibold">{formatAmount(order.total, order.currency)}</p></div></div>
          <div className={`mt-6 rounded-2xl border p-5 ${deliverySummary.tone}`}><p className="font-semibold">{deliverySummary.title}</p><p className="mt-2 text-sm">{deliverySummary.detail}</p></div>
          <div className="mt-6 rounded-2xl bg-slate-50 p-5"><h2 className="font-semibold text-slate-950">Próximo paso</h2><p className="mt-2 text-sm leading-6 text-slate-600">Consulta el seguimiento, revisa las fases de entrega y conversa con el equipo desde un solo lugar.</p></div>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row"><Link to={`/orders/${order.id}`} className="inline-flex flex-1 items-center justify-center rounded-2xl bg-orange-700 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-orange-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-600">Ver seguimiento y mensajes</Link><Link to="/orders" className="inline-flex flex-1 items-center justify-center rounded-2xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-800 transition hover:border-orange-400 hover:bg-orange-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-600">Ir a mis pedidos</Link><Link to="/" className="inline-flex flex-1 items-center justify-center rounded-2xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-800 transition hover:border-orange-400 hover:bg-orange-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-600">Seguir explorando</Link></div>
        </div>
      </section>
    </main>
  );
}
