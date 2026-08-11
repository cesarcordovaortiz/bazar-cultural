import { getPhysicalDeliveryStatusLabel } from '../../lib/physicalDelivery';
import type { DeliverySatisfaction, PhysicalDelivery, PhysicalDeliveryStatus } from '../../types';

interface Props {
  delivery: PhysicalDelivery;
  isAdmin: boolean;
  onStatusChange: (status: PhysicalDeliveryStatus) => void;
  onSatisfaction: (satisfaction: Exclude<DeliverySatisfaction, 'PENDIENTE'>) => void;
}

const NEXT_ACTION: Partial<Record<PhysicalDeliveryStatus, { status: PhysicalDeliveryStatus; label: string }>> = {
  PENDIENTE: { status: 'ASIGNADO', label: 'Asignar repartidor' },
  ASIGNADO: { status: 'RECOGIDO', label: 'Confirmar recojo' },
  RECOGIDO: { status: 'EN_RUTA', label: 'Iniciar ruta' },
  EN_RUTA: { status: 'ENTREGADO', label: 'Confirmar entrega' },
};

export function PhysicalDeliveryTracking({ delivery, isAdmin, onStatusChange, onSatisfaction }: Props) {
  const markerX = 34 + Math.round(222 * delivery.routeProgress / 100);
  const markerY = 112 - Math.round(72 * delivery.routeProgress / 100);
  const nextAction = NEXT_ACTION[delivery.status];

  return (
    <section className="rounded-3xl border border-sky-200 bg-sky-50/60 p-6" aria-label="Seguimiento de delivery">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="text-xl font-semibold text-slate-950">Entrega a domicilio</h2><p className="mt-1 text-sm text-slate-600">Código de seguimiento: <span className="font-semibold text-slate-950">{delivery.trackingCode}</span></p></div><span className="w-fit rounded-full bg-sky-700 px-3 py-1 text-sm font-semibold text-white">{getPhysicalDeliveryStatusLabel(delivery.status)}</span></div>
      <div className="mt-5 grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-2xl border border-sky-100 bg-white p-4" aria-label="Mapa de monitoreo de entrega">
          <div className="flex items-center justify-between gap-3"><div><h3 className="font-semibold text-slate-900">Mapa de recorrido</h3><p className="text-xs text-slate-500">Avance estimado: {delivery.routeProgress}%</p></div><span className="rounded-full bg-sky-50 px-2 py-1 text-xs font-semibold text-sky-800">{delivery.courierName}</span></div>
          <svg className="mt-3 h-auto w-full rounded-xl bg-sky-50" viewBox="0 0 290 150" role="img" aria-label={`Ruta demostrativa desde ${delivery.originLabel} hasta ${delivery.destinationLabel}; avance ${delivery.routeProgress} por ciento`}>
            <title>Seguimiento gráfico de entrega</title><path d="M18 30H272M18 60H272M18 90H272M18 120H272M58 12V138M116 12V138M174 12V138M232 12V138" stroke="#bfdbfe" strokeWidth="3" /><path d="M34 112C92 102 108 70 158 75S216 52 256 40" fill="none" stroke="#0ea5e9" strokeWidth="6" strokeDasharray="9 7" strokeLinecap="round" /><circle cx="34" cy="112" r="11" fill="#ea580c" /><text x="34" y="116" textAnchor="middle" fill="white" fontSize="11" fontWeight="700">B</text><circle cx="256" cy="40" r="11" fill="#059669" /><text x="256" y="44" textAnchor="middle" fill="white" fontSize="11" fontWeight="700">T</text><g transform={`translate(${markerX} ${markerY})`}><circle r="15" fill="#0f172a" opacity="0.18" /><circle r="11" fill="#0369a1" /><path d="M-5 2h10l-2-7h-6z" fill="white" /><circle cx="-3" cy="6" r="2" fill="white" /><circle cx="3" cy="6" r="2" fill="white" /></g></svg>
          <div className="mt-3 flex justify-between gap-4 text-xs text-slate-600"><span><span className="font-semibold text-orange-700">B</span> {delivery.originLabel}</span><span className="text-right"><span className="font-semibold text-emerald-700">T</span> {delivery.destinationLabel}</span></div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-sky-100"><div className="h-full rounded-full bg-sky-600 transition-all" style={{ width: `${delivery.routeProgress}%` }} /></div>
        </section>
        <section aria-label="Fases del proceso de entrega"><h3 className="font-semibold text-slate-900">Fases del proceso</h3><ol className="mt-3 space-y-3 border-l-2 border-sky-200 pl-4">{delivery.events.map((event) => <li key={event.id} className="relative"><span aria-hidden="true" className="absolute -left-[1.38rem] top-1.5 size-3 rounded-full bg-sky-600" /><p className="text-sm font-semibold text-slate-900">{getPhysicalDeliveryStatusLabel(event.status)}</p><p className="text-sm text-slate-600">{event.description}</p><time className="text-xs text-slate-500">{new Date(event.createdAt).toLocaleString()}</time></li>)}</ol></section>
      </div>
      <div className="mt-5 rounded-2xl bg-white/80 p-4 text-sm text-slate-700"><p><span className="font-semibold">Delivery:</span> {delivery.courierName} · {delivery.courierVehicle}</p><p className="mt-1 text-slate-600">Las actualizaciones del repartidor aparecen también en la conversación del pedido.</p></div>
      {isAdmin && nextAction && <button type="button" onClick={() => onStatusChange(nextAction.status)} className="mt-5 rounded-xl bg-sky-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600">{nextAction.label}</button>}
      {!isAdmin && delivery.status === 'ENTREGADO' && delivery.satisfaction === 'PENDIENTE' && <div className="mt-5"><p className="text-sm font-semibold text-slate-800">¿Cómo fue el servicio de delivery?</p><div className="mt-3 flex flex-wrap gap-2"><button type="button" onClick={() => onSatisfaction('SATISFECHO')} className="rounded-xl bg-emerald-700 px-3 py-2 text-sm font-semibold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600">Estoy satisfecho/a</button><button type="button" onClick={() => onSatisfaction('REQUIERE_AYUDA')} className="rounded-xl border border-rose-300 bg-white px-3 py-2 text-sm font-semibold text-rose-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-600">Necesito ayuda</button></div></div>}
      {!isAdmin && delivery.satisfaction !== 'PENDIENTE' && <p role="status" className="mt-5 text-sm font-semibold text-emerald-800">Gracias por responder. El equipo recibió tu comentario en el canal de mensajes.</p>}
      <p className="mt-5 text-xs leading-5 text-slate-600">Mapa demostrativo de delivery: no representa la ubicación real de una persona. La integración productiva requerirá consentimiento, un proveedor logístico y geolocalización en tiempo real.</p>
    </section>
  );
}
