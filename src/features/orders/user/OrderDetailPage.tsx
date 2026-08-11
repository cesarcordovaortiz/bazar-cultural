import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getOrderById, updateOrderStatus } from '../../../lib/orderStore';
import type { Order } from '../../../types';
import { OrderMessages } from '../../messaging/OrderMessages';
import { useAuth } from '../../auth/useAuth';
import { useCurrency } from '../../currency/CurrencyContext';
import { getDigitalDeliveryStatusLabel, recordDeliverySatisfaction, updateDigitalDeliveryStatus } from '../../../lib/digitalDelivery';
import { recordPhysicalDeliverySatisfaction, updatePhysicalDeliveryStatus } from '../../../lib/physicalDelivery';
import { PhysicalDeliveryTracking } from '../../delivery/PhysicalDeliveryTracking';
import type { DigitalDeliveryStatus, PhysicalDeliveryStatus } from '../../../types';

export function OrderDetailPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { formatAmount } = useCurrency();
  const isAdmin = user?.roles.includes('admin') ?? false;

  useEffect(() => {
    if (!orderId) return;
    const current = getOrderById(orderId);
    if (!current) {
      navigate('/orders');
      return;
    }
    if (!isAdmin && current.userId !== user?.id) {
      navigate('/orders');
      return;
    }
    setOrder(current);
  }, [orderId, navigate, isAdmin, user?.id]);

  if (!order) {
    return null;
  }

  const handleStatus = (status: 'ACEPTADO' | 'EN_CAMINO' | 'ENTREGADO' | 'CANCELADO') => {
    updateOrderStatus(order.id, status);
    setOrder({ ...order, status });
  };

  const handleDigitalDeliveryStatus = (status: DigitalDeliveryStatus): void => {
    setOrder(updateDigitalDeliveryStatus(order.id, status));
  };

  const handleDeliverySatisfaction = (satisfaction: 'SATISFECHO' | 'REQUIERE_AYUDA'): void => {
    setOrder(recordDeliverySatisfaction(order.id, satisfaction));
  };

  const handlePhysicalDeliveryStatus = (status: PhysicalDeliveryStatus): void => {
    setOrder(updatePhysicalDeliveryStatus(order.id, status));
  };

  const handlePhysicalDeliverySatisfaction = (satisfaction: 'SATISFECHO' | 'REQUIERE_AYUDA'): void => {
    setOrder(recordPhysicalDeliverySatisfaction(order.id, satisfaction));
  };

  return (
    <main className="mx-auto max-w-5xl px-4 py-16">
      <div className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-slate-950">Detalle de pedido</h1>
            <p className="text-sm text-slate-600">Pedido {order.id}</p>
          </div>
          <span className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700">{order.status}</span>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-[1.4fr_0.9fr]">
          <section className="space-y-6">
            {isAdmin && <div className="rounded-3xl border border-slate-200 p-6">
              <h2 className="text-xl font-semibold text-slate-950">Dirección</h2>
              <p className="mt-3 text-slate-600">{order.address.line1}</p>
              {order.address.line2 && <p className="text-slate-600">{order.address.line2}</p>}
              <p className="text-slate-600">{order.address.city}, {order.address.department}</p>
              <p className="text-slate-600">{order.address.postalCode}</p>
            </div>}
            <OrderMessages order={order} />
            {order.physicalDelivery && <PhysicalDeliveryTracking delivery={order.physicalDelivery} isAdmin={isAdmin} onStatusChange={handlePhysicalDeliveryStatus} onSatisfaction={handlePhysicalDeliverySatisfaction} />}
            {order.digitalDelivery && <section className="rounded-3xl border border-orange-200 bg-orange-50/50 p-6" aria-label="Seguimiento de entrega digital">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="text-xl font-semibold text-slate-950">Entrega digital</h2><p className="mt-1 text-sm text-slate-600">Código de seguimiento: <span className="font-semibold text-slate-950">{order.digitalDelivery.trackingCode}</span></p></div><span className="w-fit rounded-full bg-orange-700 px-3 py-1 text-sm font-semibold text-white">{getDigitalDeliveryStatusLabel(order.digitalDelivery.status)}</span></div>
              <ol className="mt-5 space-y-3 border-l-2 border-orange-200 pl-4">{order.digitalDelivery.events.map((event) => <li key={event.id} className="relative text-sm text-slate-700"><span aria-hidden="true" className="absolute -left-[1.42rem] top-1 h-3 w-3 rounded-full bg-orange-600" /><p className="font-semibold text-slate-950">{getDigitalDeliveryStatusLabel(event.status)}</p><p>{event.description}</p><time className="text-xs text-slate-500">{new Date(event.createdAt).toLocaleString()}</time></li>)}</ol>
              {isAdmin && order.digitalDelivery.status !== 'ENTREGADO' && <div className="mt-5 flex flex-wrap gap-2"><button type="button" onClick={() => handleDigitalDeliveryStatus('PREPARANDO_ACCESO')} className="rounded-xl border border-orange-300 bg-white px-3 py-2 text-sm font-semibold text-orange-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-600">Preparar acceso</button><button type="button" onClick={() => handleDigitalDeliveryStatus('ACCESO_ENVIADO')} className="rounded-xl border border-orange-300 bg-white px-3 py-2 text-sm font-semibold text-orange-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-600">Notificar acceso enviado</button><button type="button" onClick={() => handleDigitalDeliveryStatus('ENTREGADO')} className="rounded-xl bg-orange-700 px-3 py-2 text-sm font-semibold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-600">Confirmar entrega</button></div>}
              {!isAdmin && order.digitalDelivery.status === 'ENTREGADO' && order.digitalDelivery.satisfaction === 'PENDIENTE' && <div className="mt-5"><p className="text-sm font-semibold text-slate-800">¿Cómo fue el servicio de entrega?</p><div className="mt-3 flex flex-wrap gap-2"><button type="button" onClick={() => handleDeliverySatisfaction('SATISFECHO')} className="rounded-xl bg-emerald-700 px-3 py-2 text-sm font-semibold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600">Estoy satisfecho/a</button><button type="button" onClick={() => handleDeliverySatisfaction('REQUIERE_AYUDA')} className="rounded-xl border border-rose-300 bg-white px-3 py-2 text-sm font-semibold text-rose-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-600">Necesito ayuda</button></div></div>}
              {!isAdmin && order.digitalDelivery.satisfaction !== 'PENDIENTE' && <p role="status" className="mt-5 text-sm font-semibold text-emerald-800">Gracias por responder. El equipo recibió tu comentario en el canal de mensajes.</p>}
              <p className="mt-5 text-xs leading-5 text-slate-600">Demo de seguimiento: en producción, el acceso y los avisos se integrarán con el proveedor de contenidos y notificaciones.</p>
            </section>}
            <div className="rounded-3xl border border-slate-200 p-6">
              <h2 className="text-xl font-semibold text-slate-950">Artículos</h2>
              <div className="mt-4 space-y-4">
                {order.items.map((item) => (
                  <div key={item.product.id} className="flex items-center justify-between rounded-3xl bg-slate-50 p-4">
                    <div className="flex items-center gap-3">
                      <img src={item.product.image} alt="" width="48" height="48" loading="lazy" decoding="async" className="h-12 w-12 rounded-xl object-cover" />
                      <div>
                        <p className="font-semibold text-slate-950">{item.product.name}</p>
                        <p className="text-sm text-slate-600">Cantidad: {item.quantity}</p>
                      </div>
                    </div>
                    <p className="font-semibold text-slate-950">{formatAmount(item.product.price * item.quantity, item.product.currency)}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <aside className="space-y-6">
            {isAdmin && <div className="rounded-3xl border border-slate-200 p-6">
              <h2 className="text-xl font-semibold text-slate-950">Acciones</h2>
              <div className="mt-4 space-y-3">
                <button
                  type="button"
                  onClick={() => handleStatus('ACEPTADO')}
                  className="w-full rounded-3xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500"
                >
                  Marcar ACEPTADO
                </button>
                <button
                  type="button"
                  onClick={() => handleStatus('EN_CAMINO')}
                  className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-950 transition hover:border-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500"
                >
                  Marcar EN CAMINO
                </button>
                <button
                  type="button"
                  onClick={() => handleStatus('ENTREGADO')}
                  className="w-full rounded-3xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
                >
                  Marcar ENTREGADO
                </button>
                <button
                  type="button"
                  onClick={() => handleStatus('CANCELADO')}
                  className="w-full rounded-3xl bg-rose-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-rose-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300"
                >
                  Cancelar pedido
                </button>
              </div>
            </div>}
            <div className="rounded-3xl border border-slate-200 p-6 bg-slate-50">
              <h2 className="text-xl font-semibold text-slate-950">Resumen</h2>
              {order.subtotal !== undefined && <p className="mt-4 text-slate-600">Subtotal: {formatAmount(order.subtotal, order.currency)}</p>}
              {(order.discount ?? 0) > 0 && <p className="mt-2 text-sm font-semibold text-orange-800">Descuento de campañas: −{formatAmount(order.discount ?? 0, order.currency)}</p>}
              <p className="mt-3 text-slate-600">Total</p>
              <p className="text-3xl font-semibold text-slate-950">{formatAmount(order.total, order.currency)}</p>
              {order.paymentMethod && <p className="mt-3 text-sm text-slate-600">Pago: {order.paymentMethod.label}</p>}
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
