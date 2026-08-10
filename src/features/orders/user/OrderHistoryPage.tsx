import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { readOrders, subscribeOrders } from '../../../lib/orderStore';
import type { Order } from '../../../types';

export function OrderHistoryPage() {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    const refresh = (): void => setOrders(readOrders());
    refresh();
    return subscribeOrders(refresh);
  }, []);

  return (
    <main className="mx-auto max-w-5xl px-4 py-16">
      <div className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
        <h1 className="text-3xl font-semibold text-slate-950">Mis pedidos</h1>
        <div className="mt-8 space-y-4">
          {orders.length === 0 ? (
            <p className="text-slate-600">No hay pedidos registrados.</p>
          ) : (
            orders.map((order) => (
              <Link key={order.id} to={`/orders/${order.id}`} className="block rounded-3xl border border-slate-200 p-6 text-slate-900 transition hover:-translate-y-0.5 hover:shadow-md">
                <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center">
                  <div>
                    <p className="font-semibold">Pedido {order.id}</p>
                    <p className="text-sm text-slate-600">{new Date(order.createdAt).toLocaleString()}</p>
                  </div>
                  <div className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700">{order.status}</div>
                </div>
                <div className="mt-4 flex items-center justify-between text-sm text-slate-600">
                  <span>{order.items.length} artículos</span>
                  <span>Total ${order.total.toFixed(2)}</span>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </main>
  );
}
