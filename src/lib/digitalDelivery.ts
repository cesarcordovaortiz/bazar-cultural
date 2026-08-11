import { readOrders, saveOrder } from './orderStore';
import { sendMessage } from './messageStore';
import type { CartItem, DeliverySatisfaction, DigitalDelivery, DigitalDeliveryStatus, Order } from '../types';

const DELIVERY_STATUS_COPY: Record<DigitalDeliveryStatus, string> = {
  PENDIENTE: 'Pedido digital recibido. Espera la preparación de tu acceso.',
  PREPARANDO_ACCESO: 'Estamos preparando tu acceso digital.',
  ACCESO_ENVIADO: 'El acceso digital fue enviado. Revisa este pedido para continuar.',
  ENTREGADO: 'La entrega digital fue confirmada. Cuéntanos cómo fue tu experiencia.',
};

const ORDER_STATUS_BY_DELIVERY: Partial<Record<DigitalDeliveryStatus, Order['status']>> = {
  PREPARANDO_ACCESO: 'ACEPTADO',
  ACCESO_ENVIADO: 'EN_CAMINO',
  ENTREGADO: 'ENTREGADO',
};

export function getDigitalDeliveryStatusLabel(status: DigitalDeliveryStatus): string {
  return {
    PENDIENTE: 'Pedido recibido',
    PREPARANDO_ACCESO: 'Preparando acceso',
    ACCESO_ENVIADO: 'Acceso enviado',
    ENTREGADO: 'Entrega confirmada',
  }[status];
}

export function createDigitalDelivery(orderId: string, items: CartItem[]): DigitalDelivery | undefined {
  const digitalItems = items.filter((item) => item.product.fulfillmentType === 'digital');
  if (digitalItems.length === 0) return undefined;

  const createdAt = Date.now();
  return {
    trackingCode: `DIG-${orderId.replace('order-', '').slice(-8).toUpperCase()}`,
    productIds: digitalItems.map((item) => item.product.id),
    status: 'PENDIENTE',
    satisfaction: 'PENDIENTE',
    events: [{ id: `delivery-event-${createdAt}`, status: 'PENDIENTE', description: DELIVERY_STATUS_COPY.PENDIENTE, createdAt }],
  };
}

function getOrder(orderId: string): Order {
  const order = readOrders().find((item) => item.id === orderId);
  if (!order || !order.digitalDelivery) throw new Error('No se encontró una entrega digital para este pedido.');
  return order;
}

export function updateDigitalDeliveryStatus(orderId: string, status: DigitalDeliveryStatus): Order {
  const order = getOrder(orderId);
  if (order.digitalDelivery?.status === status) return order;

  const createdAt = Date.now();
  const digitalDelivery: DigitalDelivery = {
    ...order.digitalDelivery!,
    status,
    events: [...order.digitalDelivery!.events, { id: `delivery-event-${createdAt}`, status, description: DELIVERY_STATUS_COPY[status], createdAt }],
  };
  const updatedOrder: Order = { ...order, digitalDelivery, status: ORDER_STATUS_BY_DELIVERY[status] ?? order.status };
  saveOrder(updatedOrder);
  sendMessage({ id: `delivery-notification-${createdAt}`, orderId, fromUserId: 'admin-1', toUserId: order.userId, text: `Actualización de entrega digital: ${DELIVERY_STATUS_COPY[status]}`, createdAt, seen: false });
  return updatedOrder;
}

export function recordDeliverySatisfaction(orderId: string, satisfaction: Exclude<DeliverySatisfaction, 'PENDIENTE'>): Order {
  const order = getOrder(orderId);
  const updatedOrder: Order = { ...order, digitalDelivery: { ...order.digitalDelivery!, satisfaction } };
  saveOrder(updatedOrder);
  const createdAt = Date.now();
  const text = satisfaction === 'SATISFECHO'
    ? 'Confirmo que recibí mi compra digital y estoy satisfecho/a con el servicio.'
    : 'Necesito ayuda con la entrega digital de este pedido.';
  sendMessage({ id: `delivery-satisfaction-${createdAt}`, orderId, fromUserId: order.userId, toUserId: 'admin-1', text, createdAt, seen: false });
  return updatedOrder;
}
