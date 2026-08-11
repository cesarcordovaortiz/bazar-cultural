import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { getInteractionStageLabel, getMessageStage, getMessageType, getInteractionTypeLabel, getOrderInteractionStage, INTERACTION_STAGES } from '../../lib/interactions';
import { readMessages, sendMessage, subscribeMessages } from '../../lib/messageStore';
import type { InteractionStage, InteractionType, Message, Order } from '../../types';
import { useAuth } from '../auth/useAuth';

interface MessageFormValues { text: string; interactionType: InteractionType; }
interface Props { order: Order; }
type StageFilter = InteractionStage | 'ALL';

function getParticipant(message: Message, order: Order, currentUserId?: string) {
  if (message.fromUserId === 'delivery-1') return { name: 'Camila · Delivery', initials: 'CR', tone: 'bg-sky-600' };
  if (message.fromUserId === 'admin-1') return { name: message.fromUserId === currentUserId ? 'Tú · Equipo Bazar' : 'Equipo Bazar', initials: 'BC', tone: 'bg-orange-700' };
  if (message.fromUserId === order.userId) return { name: message.fromUserId === currentUserId ? 'Tú' : 'Cliente', initials: 'CL', tone: 'bg-slate-700' };
  return { name: 'Participante', initials: 'P', tone: 'bg-slate-500' };
}

export function OrderMessages({ order }: Props) {
  const { user } = useAuth();
  const isAdmin = user?.roles.includes('admin') ?? false;
  const [messages, setMessages] = useState<Message[]>([]);
  const [stageFilter, setStageFilter] = useState<StageFilter>('ALL');
  const { register, handleSubmit, reset } = useForm<MessageFormValues>({ defaultValues: { text: '', interactionType: 'CONSULTA' } });
  const currentStage = getOrderInteractionStage(order);

  useEffect(() => {
    const refresh = (): void => setMessages(readMessages(order.id));
    refresh();
    return subscribeMessages(refresh);
  }, [order.id]);

  const filteredMessages = useMemo(() => messages.filter((message) => stageFilter === 'ALL' || getMessageStage(message, order) === stageFilter), [messages, order, stageFilter]);

  const onSubmit = (values: MessageFormValues): void => {
    const text = values.text.trim();
    if (!text || !user) return;
    sendMessage({
      id: `message-${Date.now()}`,
      orderId: order.id,
      fromUserId: user.id,
      toUserId: isAdmin ? order.userId : 'admin-1',
      text,
      createdAt: Date.now(),
      seen: false,
      stage: currentStage,
      interactionType: values.interactionType,
    });
    reset({ text: '', interactionType: values.interactionType });
  };

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6" aria-label="Conversación del pedido">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div><h2 className="text-xl font-semibold text-slate-950">Mensajes del pedido</h2><p className="mt-1 text-sm text-slate-600">{isAdmin ? 'Conversación entre cliente, equipo Bazar y delivery.' : 'Tu conversación con el equipo Bazar y delivery.'}</p></div>
        <span className="w-fit rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-900">Etapa actual: {getInteractionStageLabel(currentStage)}</span>
      </div>
      <div className="mt-5 border-y border-slate-100 py-3" aria-label="Filtrar mensajes por etapa">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Etapas de conversación</p>
        <div className="flex flex-wrap gap-2"><button type="button" onClick={() => setStageFilter('ALL')} aria-pressed={stageFilter === 'ALL'} className={stageFilter === 'ALL' ? 'rounded-full bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white' : 'rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200'}>Todas</button>{INTERACTION_STAGES.map((stage) => <button key={stage} type="button" onClick={() => setStageFilter(stage)} aria-pressed={stageFilter === stage} className={stageFilter === stage ? 'rounded-full bg-orange-700 px-3 py-1.5 text-xs font-semibold text-white' : 'rounded-full bg-orange-50 px-3 py-1.5 text-xs font-semibold text-orange-900 hover:bg-orange-100'}>{getInteractionStageLabel(stage)}</button>)}</div>
      </div>
      <div className="mt-5 max-h-[28rem] space-y-4 overflow-y-auto pr-1" aria-live="polite">
        {filteredMessages.length === 0 ? <p className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">No hay mensajes en esta etapa. Escribe al equipo para consultar tu pedido.</p> : filteredMessages.map((message) => {
          const participant = getParticipant(message, order, user?.id);
          const isOwn = message.fromUserId === user?.id;
          const stage = getMessageStage(message, order);
          const type = getMessageType(message);
          return <article key={message.id} className={`flex max-w-[92%] gap-3 ${isOwn ? 'ml-auto flex-row-reverse' : ''}`}>
            <div aria-hidden="true" className={`grid size-9 shrink-0 place-items-center rounded-full text-xs font-bold text-white ${participant.tone}`}>{participant.initials}</div>
            <div className={isOwn ? 'text-right' : ''}><div className={`mb-1 flex flex-wrap items-center gap-2 text-xs ${isOwn ? 'justify-end' : ''}`}><span className="font-semibold text-slate-800">{participant.name}</span><span className="rounded-full bg-slate-100 px-2 py-0.5 font-medium text-slate-600">{getInteractionStageLabel(stage)}</span><span className="rounded-full bg-sky-50 px-2 py-0.5 font-medium text-sky-800">{getInteractionTypeLabel(type)}</span></div><div className={isOwn ? 'rounded-2xl rounded-tr-sm bg-orange-700 px-4 py-3 text-left text-sm text-white' : 'rounded-2xl rounded-tl-sm bg-slate-100 px-4 py-3 text-sm text-slate-800'}>{message.text}</div><time className="mt-1 block text-xs text-slate-500">{new Date(message.createdAt).toLocaleString()}</time></div>
          </article>;
        })}
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="mt-5 rounded-2xl bg-slate-50 p-3">
        <div className="flex flex-col gap-3 sm:flex-row"><label className="text-sm text-slate-700">Tipo de interacción<select {...register('interactionType')} className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-600"><option value="CONSULTA">Consulta</option><option value="PEDIDO">Gestión de pedido</option><option value="ENTREGA">Delivery</option><option value="SOPORTE">Soporte</option><option value="SATISFACCION">Satisfacción</option></select></label><label className="sr-only" htmlFor={`order-message-${order.id}`}>Mensaje</label><input id={`order-message-${order.id}`} {...register('text', { required: true })} placeholder="Escribe un mensaje" className="min-w-0 flex-1 self-end rounded-xl border border-slate-200 bg-white px-3 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-600" /><button className="self-end rounded-xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-600">Enviar</button></div>
        <p className="mt-2 text-xs text-slate-500">El mensaje se clasificará automáticamente en la etapa «{getInteractionStageLabel(currentStage)}».</p>
      </form>
    </section>
  );
}
