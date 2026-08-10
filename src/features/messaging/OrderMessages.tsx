import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { readMessages, sendMessage, subscribeMessages } from '../../lib/messageStore';
import type { Message } from '../../types';

interface MessageFormValues { text: string; }

interface Props { orderId: string; }

export function OrderMessages({ orderId }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const { register, handleSubmit, reset } = useForm<MessageFormValues>({ defaultValues: { text: '' } });

  useEffect(() => {
    const refresh = (): void => setMessages(readMessages(orderId));
    refresh();
    return subscribeMessages(refresh);
  }, [orderId]);

  const onSubmit = (values: MessageFormValues): void => {
    const text = values.text.trim();
    if (!text) return;
    sendMessage({ id: `message-${Date.now()}`, orderId, fromUserId: 'user-1', toUserId: 'admin-1', text, createdAt: Date.now(), seen: false });
    reset();
  };

  return (
    <section className="rounded-3xl border border-slate-200 p-6">
      <h2 className="text-xl font-semibold text-slate-950">Mensajes del pedido</h2>
      <div className="mt-4 max-h-64 space-y-3 overflow-y-auto" aria-live="polite">
        {messages.length === 0 ? <p className="text-sm text-slate-600">No hay mensajes todavía. Escribe al equipo para consultar tu pedido.</p> : messages.map((message) => <article key={message.id} className="rounded-2xl bg-slate-50 p-3"><p className="text-sm text-slate-800">{message.text}</p><p className="mt-1 text-xs text-slate-500">{new Date(message.createdAt).toLocaleString()}</p></article>)}
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="mt-4 flex gap-3">
        <label className="sr-only" htmlFor="order-message">Mensaje</label>
        <input id="order-message" {...register('text', { required: true })} placeholder="Escribe un mensaje" className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500" />
        <button className="rounded-xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500">Enviar</button>
      </form>
    </section>
  );
}
