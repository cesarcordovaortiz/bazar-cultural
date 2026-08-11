import type { InteractionStage, InteractionType, Message, Order } from '../types';

export const INTERACTION_STAGES: InteractionStage[] = ['CONSULTA', 'CONFIRMACION', 'PREPARACION', 'DESPACHO', 'EN_RUTA', 'RECEPCION', 'POSTENTREGA'];

const STAGE_LABELS: Record<InteractionStage, string> = {
  CONSULTA: 'Consulta',
  CONFIRMACION: 'Confirmación',
  PREPARACION: 'Preparación',
  DESPACHO: 'Despacho',
  EN_RUTA: 'En ruta',
  RECEPCION: 'Recepción',
  POSTENTREGA: 'Postentrega',
};

const TYPE_LABELS: Record<InteractionType, string> = {
  CONSULTA: 'Consulta',
  PEDIDO: 'Gestión de pedido',
  ENTREGA: 'Delivery',
  SOPORTE: 'Soporte',
  SATISFACCION: 'Satisfacción',
};

export function getInteractionStageLabel(stage: InteractionStage): string {
  return STAGE_LABELS[stage];
}

export function getInteractionTypeLabel(type: InteractionType): string {
  return TYPE_LABELS[type];
}

export function getOrderInteractionStage(order: Order): InteractionStage {
  if (order.physicalDelivery) {
    return ({
      PENDIENTE: 'CONFIRMACION',
      ASIGNADO: 'DESPACHO',
      RECOGIDO: 'DESPACHO',
      EN_RUTA: 'EN_RUTA',
      ENTREGADO: 'RECEPCION',
    } as const)[order.physicalDelivery.status];
  }
  if (order.digitalDelivery) {
    return ({
      PENDIENTE: 'CONFIRMACION',
      PREPARANDO_ACCESO: 'PREPARACION',
      ACCESO_ENVIADO: 'DESPACHO',
      ENTREGADO: 'RECEPCION',
    } as const)[order.digitalDelivery.status];
  }
  return ({
    PENDIENTE: 'CONSULTA',
    ACEPTADO: 'PREPARACION',
    EN_CAMINO: 'EN_RUTA',
    ENTREGADO: 'RECEPCION',
    CANCELADO: 'POSTENTREGA',
  } as const)[order.status];
}

export function getMessageStage(message: Message, order: Order): InteractionStage {
  return message.stage ?? getOrderInteractionStage(order);
}

export function getMessageType(message: Message): InteractionType {
  return message.interactionType ?? 'CONSULTA';
}
