import { useMemo } from 'react';
import { getInteractionStageLabel, getMessageStage, getMessageType, getInteractionTypeLabel, INTERACTION_STAGES } from '../../lib/interactions';
import type { InteractionType, Message, Order } from '../../types';

interface Props { orders: Order[]; messages: Message[]; }

const INTERACTION_TYPES: InteractionType[] = ['CONSULTA', 'PEDIDO', 'ENTREGA', 'SOPORTE', 'SATISFACCION'];

export function InteractionAnalytics({ orders, messages }: Props) {
  const report = useMemo(() => {
    const ordersById = new Map(orders.map((order) => [order.id, order]));
    const classified = messages.flatMap((message) => {
      const order = ordersById.get(message.orderId);
      return order ? [{ message, order }] : [];
    });
    const byStage = INTERACTION_STAGES.map((stage) => ({ stage, total: classified.filter(({ message, order }) => getMessageStage(message, order) === stage).length }));
    const byType = INTERACTION_TYPES.map((type) => ({ type, total: classified.filter(({ message }) => getMessageType(message) === type).length }));
    const mostActive = [...byStage].sort((first, second) => second.total - first.total)[0];
    return { total: classified.length, byStage, byType, mostActive };
  }, [messages, orders]);
  const max = Math.max(1, ...report.byStage.map((item) => item.total));

  return (
    <section className="mb-8 rounded-3xl border border-orange-200 bg-white p-6 shadow-sm" aria-label="Analítica de interacciones">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-sm font-semibold uppercase tracking-wider text-orange-800">Atención operativa</p><h2 className="mt-1 text-2xl font-semibold text-slate-950">Interacciones por etapa</h2><p className="mt-2 text-sm text-slate-600">Identifica dónde se concentra la conversación para priorizar la atención del equipo.</p></div><div className="rounded-2xl bg-orange-50 px-4 py-3 text-sm text-orange-950"><p className="font-semibold">{report.total} interacciones</p><p className="mt-1">Mayor actividad: {getInteractionStageLabel(report.mostActive.stage)} ({report.mostActive.total})</p></div></div>
      <div className="mt-6 grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
        <figure className="rounded-2xl bg-slate-50 p-4"><figcaption className="text-sm font-semibold text-slate-800">Volumen por fase del pedido</figcaption><svg className="mt-3 h-auto w-full" viewBox="0 0 560 210" role="img" aria-label={report.byStage.map((item) => `${getInteractionStageLabel(item.stage)}: ${item.total}`).join(', ')}><line x1="38" y1="164" x2="540" y2="164" stroke="#cbd5e1" strokeWidth="2" />{report.byStage.map((item, index) => { const height = Math.round(item.total / max * 112); const x = 48 + index * 70; return <g key={item.stage}><rect x={x} y={164 - height} width="40" height={height} rx="6" fill={item.stage === report.mostActive.stage && item.total > 0 ? '#ea580c' : '#0f766e'} /><text x={x + 20} y="184" textAnchor="middle" fontSize="10" fill="#475569">{getInteractionStageLabel(item.stage).split(' ')[0]}</text><text x={x + 20} y={154 - height} textAnchor="middle" fontSize="12" fontWeight="700" fill="#0f172a">{item.total}</text></g>; })}</svg></figure>
        <section className="rounded-2xl border border-slate-200 p-4" aria-label="Tipología de interacciones"><h3 className="text-sm font-semibold text-slate-800">Tipología</h3><ul className="mt-3 space-y-3">{report.byType.map((item) => <li key={item.type}><div className="flex items-center justify-between text-sm"><span className="text-slate-700">{getInteractionTypeLabel(item.type)}</span><span className="font-semibold text-slate-950">{item.total}</span></div><div className="mt-1.5 h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-sky-600" style={{ width: `${report.total ? item.total / report.total * 100 : 0}%` }} /></div></li>)}</ul></section>
      </div>
    </section>
  );
}
