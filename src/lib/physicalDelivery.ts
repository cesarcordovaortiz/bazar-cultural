import { readOrders, saveOrder } from './orderStore';
import { sendMessage } from './messageStore';
import type { Address, CartItem, DeliverySatisfaction, InteractionStage, Order, PhysicalDelivery, PhysicalDeliveryStatus } from '../types';

const DELIVERY_STATUS_COPY: Record<PhysicalDeliveryStatus, string> = {
  PENDIENTE: 'Pedido confirmado. Prepararemos tu compra para el despacho.',
  ASIGNADO: 'Camila fue asignada a tu entrega y revisará el pedido antes de recogerlo.',
  RECOGIDO: 'Tu pedido fue recogido en el punto de despacho.',
  EN_RUTA: 'Camila está en ruta hacia tu dirección. Puedes seguir el avance en el mapa.',
  ENTREGADO: 'La entrega fue confirmada. Cuéntanos cómo fue tu experiencia.',
};

const STATUS_LABELS: Record<PhysicalDeliveryStatus, string> = {
  PENDIENTE: 'Pedido confirmado',
  ASIGNADO: 'Repartidor asignado',
  RECOGIDO: 'Pedido recogido',
  EN_RUTA: 'En ruta',
  ENTREGADO: 'Entrega confirmada',
};

const ORDER_STATUS_BY_DELIVERY: Partial<Record<PhysicalDeliveryStatus, Order['status']>> = {
  ASIGNADO: 'ACEPTADO',
  RECOGIDO: 'ACEPTADO',
  EN_RUTA: 'EN_CAMINO',
  ENTREGADO: 'ENTREGADO',
};

const STAGE_BY_DELIVERY: Record<PhysicalDeliveryStatus, InteractionStage> = {
  PENDIENTE: 'CONFIRMACION',
  ASIGNADO: 'DESPACHO',
  RECOGIDO: 'DESPACHO',
  EN_RUTA: 'EN_RUTA',
  ENTREGADO: 'RECEPCION',
};

const PROGRESS_BY_DELIVERY: Record<PhysicalDeliveryStatus, number> = { PENDIENTE: 8, ASIGNADO: 22, RECOGIDO: 46, EN_RUTA: 72, ENTREGADO: 100 };

export function getPhysicalDeliveryStatusLabel(status: PhysicalDeliveryStatus): string {
  return STATUS_LABELS[status];
}

export function createPhysicalDelivery(orderId: string, items: CartItem[], address: Address): PhysicalDelivery | undefined {
  const physicalItems = items.filter((item) => item.product.fulfillmentType !== 'digital');
  if (physicalItems.length === 0) return undefined;
  const createdAt = Date.now();
  return {
    trackingCode: `DEL-${orderId.replace('order-', '').slice(-8).toUpperCase()}`,
    status: 'PENDIENTE',
    courierName: 'Camila Rojas',
    courierVehicle: 'Motocicleta · BC-204',
    originLabel: 'Centro cultural Bazar',
    destinationLabel: `${address.city}, ${address.department}`,
    routeProgress: PROGRESS_BY_DELIVERY.PENDIENTE,
    satisfaction: 'PENDIENTE',
    events: [{ id: `physical-delivery-event-${createdAt}`, status: 'PENDIENTE', description: DELIVERY_STATUS_COPY.PENDIENTE, createdAt }],
  };
}

function getOrder(orderId: string): Order {
  const order = readOrders().find((item) => item.id === orderId);
  if (!order || !order.physicalDelivery) throw new Error('No se encontró una entrega a domicilio para este pedido.');
  return order;
}

export function updatePhysicalDeliveryStatus(orderId: string, status: PhysicalDeliveryStatus): Order {
  const order = getOrder(orderId);
  if (order.physicalDelivery?.status === status) return order;
  const createdAt = Date.now();
  const physicalDelivery: PhysicalDelivery = {
    ...order.physicalDelivery!,
    status,
    routeProgress: PROGRESS_BY_DELIVERY[status],
    events: [...order.physicalDelivery!.events, { id: `physical-delivery-event-${createdAt}`, status, description: DELIVERY_STATUS_COPY[status], createdAt }],
  };
  const updatedOrder: Order = { ...order, physicalDelivery, status: ORDER_STATUS_BY_DELIVERY[status] ?? order.status };
  saveOrder(updatedOrder);
  sendMessage({
    id: `physical-delivery-notification-${createdAt}`,
    orderId,
    fromUserId: status === 'RECOGIDO' || status === 'EN_RUTA' ? 'delivery-1' : 'admin-1',
    toUserId: order.userId,
    text: `Actualización de delivery: ${DELIVERY_STATUS_COPY[status]}`,
    createdAt,
    seen: false,
    stage: STAGE_BY_DELIVERY[status],
    interactionType: 'ENTREGA',
  });
  return updatedOrder;
}

export function recordPhysicalDeliverySatisfaction(orderId: string, satisfaction: Exclude<DeliverySatisfaction, 'PENDIENTE'>): Order {
  const order = getOrder(orderId);
  const updatedOrder: Order = { ...order, physicalDelivery: { ...order.physicalDelivery!, satisfaction } };
  saveOrder(updatedOrder);
  const createdAt = Date.now();
  const text = satisfaction === 'SATISFECHO'
    ? 'Confirmo que recibí mi compra y estoy satisfecho/a con el delivery.'
    : 'Necesito ayuda con la entrega a domicilio de este pedido.';
  sendMessage({ id: `physical-delivery-satisfaction-${createdAt}`, orderId, fromUserId: order.userId, toUserId: 'admin-1', text, createdAt, seen: false, stage: 'POSTENTREGA', interactionType: 'SATISFACCION' });
  return updatedOrder;
}
