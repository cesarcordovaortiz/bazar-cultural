import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { FixedSizeList as List } from 'react-window';
import { readOrders, subscribeOrders, updateOrderStatus } from '../../../lib/orderStore';
import type { Order, OrderStatus } from '../../../types';

const STATUS_FILTERS: OrderStatus[] = ['PENDIENTE', 'ACEPTADO', 'EN_CAMINO', 'ENTREGADO', 'CANCELADO'];
const PAGE_SIZE = 20;

type SortOption = 'newest' | 'oldest' | 'total-desc' | 'total-asc';

function formatCurrency(value: number) {
  return `$${value.toFixed(2)}`;
}

export function AdminOrdersPage() {
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'ALL'>('ALL');
  const [search, setSearch] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [sort, setSort] = useState<SortOption>('newest');
  const [page, setPage] = useState(1);

  useEffect(() => {
    const refresh = (): void => setOrders(readOrders());
    refresh();
    return subscribeOrders(refresh);
  }, []);

  const filteredOrders = useMemo(() => {
    const matchingOrders = orders.filter((order) => {
      const statusMatch = statusFilter === 'ALL' || order.status === statusFilter;
      const searchMatch = [order.id, order.userId, order.status, String(order.total)].some((field) =>
        field.toLowerCase().includes(search.toLowerCase()),
      );
      return statusMatch && searchMatch;
    });
    return [...matchingOrders].sort((first, second) => {
      if (sort === 'oldest') return first.createdAt - second.createdAt;
      if (sort === 'total-desc') return second.total - first.total;
      if (sort === 'total-asc') return first.total - second.total;
      return second.createdAt - first.createdAt;
    });
  }, [orders, search, sort, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const visibleOrders = useMemo(() => filteredOrders.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE), [currentPage, filteredOrders]);

  const applyStatusFilter = (nextStatus: OrderStatus | 'ALL'): void => {
    setStatusFilter(nextStatus);
    setPage(1);
  };

  const handleStatusUpdate = (orderId: string, status: OrderStatus) => {
    updateOrderStatus(orderId, status);
    setOrders((current) => current.map((order) => (order.id === orderId ? { ...order, status } : order)));
  };

  return (
    <main className="mx-auto max-w-6xl px-4 py-12">
      <div className="mb-8 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-slate-950">Admin Orders</h1>
            <p className="text-slate-600">Gestión de pedidos y estado en tiempo real.</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <input
              value={search}
              onChange={(event) => { setSearch(event.target.value); setPage(1); }}
              placeholder="Buscar pedidos..."
              className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
            />
            <button
              type="button"
              onClick={() => setOrders(readOrders())}
              className="rounded-3xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500"
            >
              Refrescar
            </button>
            <label className="sr-only" htmlFor="order-sort">Ordenar pedidos</label>
            <select id="order-sort" value={sort} onChange={(event) => { setSort(event.target.value as SortOption); setPage(1); }} className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus-visible:ring-2 focus-visible:ring-slate-500">
              <option value="newest">Más recientes</option>
              <option value="oldest">Más antiguos</option>
              <option value="total-desc">Mayor monto</option>
              <option value="total-asc">Menor monto</option>
            </select>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            aria-pressed={statusFilter === 'ALL'}
            onClick={() => applyStatusFilter('ALL')}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${statusFilter === 'ALL' ? 'bg-slate-950 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
          >
            Todos
          </button>
          {STATUS_FILTERS.map((status) => (
            <button
              key={status}
              type="button"
              aria-pressed={statusFilter === status}
              onClick={() => applyStatusFilter(status)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${statusFilter === status ? 'bg-slate-950 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      <section className="rounded-3xl bg-white p-4 shadow-sm ring-1 ring-slate-200" aria-label="Lista de pedidos">
        {visibleOrders.length === 0 ? <p className="p-6 text-center text-slate-600">No hay pedidos que coincidan con los filtros.</p> : <List
          itemCount={visibleOrders.length}
          itemSize={110}
          width="100%"
          height={Math.min(visibleOrders.length * 110, 580)}
          className="overflow-hidden"
        >
          {({ index, style }) => {
            const order = visibleOrders[index];
            return (
              <div style={style} className="flex flex-col gap-3 border-b border-slate-200 px-4 py-3 last:border-b-0 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-semibold text-slate-950">{order.id}</p>
                  <p className="text-sm text-slate-600">Usuario {order.userId}</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700">{formatCurrency(order.total)}</span>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700">{order.status}</span>
                  <label className="sr-only" htmlFor={`order-status-${order.id}`}>Estado del pedido {order.id}</label>
                  <select id={`order-status-${order.id}`} value={order.status} onChange={(event) => handleStatusUpdate(order.id, event.target.value as OrderStatus)} className="rounded-full border border-slate-300 bg-white px-3 py-1 text-sm font-semibold text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500">
                    {STATUS_FILTERS.map((status) => <option key={status} value={status}>{status}</option>)}
                  </select>
                  <Link
                    to={`/orders/${order.id}`}
                    className="rounded-full bg-slate-950 px-3 py-1 text-sm font-semibold text-white transition hover:bg-slate-800"
                  >
                    Ver detalle
                  </Link>
                  {order.status !== 'CANCELADO' && <button type="button" onClick={() => handleStatusUpdate(order.id, 'CANCELADO')} className="rounded-full bg-rose-500 px-3 py-1 text-sm font-semibold text-white transition hover:bg-rose-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400">CANCELAR</button>}
                </div>
              </div>
            );
          }}
        </List>
        }
        {filteredOrders.length > 0 && <div className="flex flex-col gap-3 border-t border-slate-200 px-4 pt-4 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between"><p>Mostrando {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, filteredOrders.length)} de {filteredOrders.length}</p><div className="flex gap-2"><button type="button" disabled={currentPage === 1} onClick={() => setPage((value) => value - 1)} className="rounded-xl border border-slate-300 px-3 py-2 font-semibold disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500">Anterior</button><button type="button" disabled={currentPage === totalPages} onClick={() => setPage((value) => value + 1)} className="rounded-xl border border-slate-300 px-3 py-2 font-semibold disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500">Siguiente</button></div></div>}
      </section>
    </main>
  );
}
