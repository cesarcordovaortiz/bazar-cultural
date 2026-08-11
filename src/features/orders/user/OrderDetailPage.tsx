import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getOrderById, updateOrderStatus } from '../../../lib/orderStore';
import type { Order } from '../../../types';
import { OrderMessages } from '../../messaging/OrderMessages';
import { useAuth } from '../../auth/useAuth';

export function OrderDetailPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.roles.includes('admin') ?? false;

  useEffect(() => {
    if (!orderId) return;
    const current = getOrderById(orderId);
    if (!current) {
      navigate('/orders');
      return;
    }
    setOrder(current);
  }, [orderId, navigate]);

  if (!order) {
    return null;
  }

  const handleStatus = (status: 'ACEPTADO' | 'EN_CAMINO' | 'ENTREGADO' | 'CANCELADO') => {
    updateOrderStatus(order.id, status);
    setOrder({ ...order, status });
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
            <OrderMessages orderId={order.id} />
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
                    <p className="font-semibold text-slate-950">${(item.product.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <aside className="space-y-6">
            <div className="rounded-3xl border border-slate-200 p-6">
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
            </div>
            <div className="rounded-3xl border border-slate-200 p-6 bg-slate-50">
              <h2 className="text-xl font-semibold text-slate-950">Resumen</h2>
              {order.subtotal !== undefined && <p className="mt-4 text-slate-600">Subtotal: ${order.subtotal.toFixed(2)}</p>}
              {(order.discount ?? 0) > 0 && <p className="mt-2 text-sm font-semibold text-orange-800">Descuento de campañas: −${order.discount?.toFixed(2)}</p>}
              <p className="mt-3 text-slate-600">Total</p>
              <p className="text-3xl font-semibold text-slate-950">${order.total.toFixed(2)}</p>
              {order.paymentMethod && <p className="mt-3 text-sm text-slate-600">Pago: {order.paymentMethod.label}</p>}
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
