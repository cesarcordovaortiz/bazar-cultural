import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/useAuth';
import { readOrders, subscribeOrders } from '../../lib/orderStore';
import { readAllMessages, subscribeMessages } from '../../lib/messageStore';
import type { Message, Order } from '../../types';
import { OrderMessages } from './OrderMessages';
import { InteractionAnalytics } from './InteractionAnalytics';

export function MessagesPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const isAdmin = user?.roles.includes('admin') ?? false;

  useEffect(() => {
    const refresh = (): void => setOrders(readOrders());
    refresh();
    return subscribeOrders(refresh);
  }, []);

  useEffect(() => {
    const refresh = (): void => setMessages(readAllMessages());
    refresh();
    return subscribeMessages(refresh);
  }, []);

  const visibleOrders = useMemo(() => isAdmin ? orders : orders.filter((order) => order.userId === user?.id), [isAdmin, orders, user?.id]);
  const activeOrderId = selectedOrderId && visibleOrders.some((order) => order.id === selectedOrderId) ? selectedOrderId : visibleOrders[0]?.id;
  const activeOrder = visibleOrders.find((order) => order.id === activeOrderId);

  return (
    <main className="mx-auto max-w-6xl px-4 py-12">
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-wider text-orange-800">Atención cultural</p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-950">Centro de mensajes</h1>
        <p className="mt-3 text-slate-600">Consulta y conversa sobre la preparación o entrega de cada pedido.</p>
      </div>
      {isAdmin && <InteractionAnalytics orders={orders} messages={messages} />}
      {visibleOrders.length === 0 ? (
        <section className="cultural-surface rounded-3xl p-8 text-center">
          <h2 className="text-xl font-semibold text-slate-950">Aún no tienes conversaciones</h2>
          <p className="mt-3 text-slate-600">Cuando realices un pedido, podrás escribir al equipo desde aquí.</p>
          <Link to="/" className="mt-6 inline-flex rounded-2xl bg-orange-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-600">Explorar catálogo</Link>
        </section>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[18rem_1fr]">
          <aside className="cultural-surface h-fit rounded-3xl p-3" aria-label="Pedidos con mensajes">
            <p className="px-3 py-2 text-sm font-semibold text-slate-700">Pedidos</p>
            <div className="space-y-1">{visibleOrders.map((order) => <button key={order.id} type="button" onClick={() => setSelectedOrderId(order.id)} aria-pressed={activeOrderId === order.id} className={activeOrderId === order.id ? 'w-full rounded-2xl bg-orange-700 px-4 py-3 text-left text-sm font-semibold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-600' : 'w-full rounded-2xl px-4 py-3 text-left text-sm font-semibold text-slate-700 transition hover:bg-orange-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-600'}><span className="block truncate">{order.id}</span><span className="mt-1 block text-xs font-medium opacity-80">{order.status}</span></button>)}</div>
          </aside>
          {activeOrder && <OrderMessages order={activeOrder} />}
        </div>
      )}
    </main>
  );
}
