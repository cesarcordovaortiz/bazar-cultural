import type { PaymentMethod, PaymentMethodType } from '../types';

export const PAYMENT_METHOD_OPTIONS: Array<{ value: PaymentMethodType; label: string; example: string }> = [
  { value: 'cash', label: 'Efectivo contra entrega', example: 'Ejemplo: pago en Bs al recibir una compra física.' },
  { value: 'transfer', label: 'Transferencia bancaria', example: 'Ejemplo: Banco Unión · cuenta terminada en 1234.' },
  { value: 'wallet', label: 'Billetera digital', example: 'Ejemplo: Tigo Money · número registrado 7XX XXX XX.' },
  { value: 'card', label: 'Tarjeta', example: 'Ejemplo: Visa ·•••• 4242. Nunca se guardan números completos.' },
];

export function getPaymentMethodExample(type: PaymentMethodType): string {
  return PAYMENT_METHOD_OPTIONS.find((method) => method.value === type)?.example ?? '';
}

export function buildPaymentMethodLabel(method: Pick<PaymentMethod, 'type' | 'cardBrand' | 'last4' | 'bankName' | 'walletProvider' | 'walletPhone'>): string {
  if (method.type === 'card') return `${method.cardBrand || 'Tarjeta'} ·•••• ${method.last4 || '0000'}`;
  if (method.type === 'transfer') return `${method.bankName || 'Banco'} ·•••• ${method.last4 || '0000'}`;
  if (method.type === 'wallet') return `${method.walletProvider || 'Billetera digital'} · ${method.walletPhone || 'número registrado'}`;
  return 'Efectivo contra entrega';
}
