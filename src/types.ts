export type OrderStatus = 'PENDIENTE' | 'ACEPTADO' | 'EN_CAMINO' | 'ENTREGADO' | 'CANCELADO';
export type ProductType = 'book' | 'music' | 'movie' | 'print' | 'painting' | 'sculpture';
export type CurrencyCode = 'USD' | 'BOB';
export type PaymentMethodType = 'card' | 'transfer' | 'cash' | 'wallet';
export type FulfillmentType = 'digital' | 'physical';
export type DigitalDeliveryStatus = 'PENDIENTE' | 'PREPARANDO_ACCESO' | 'ACCESO_ENVIADO' | 'ENTREGADO';
export type DeliverySatisfaction = 'PENDIENTE' | 'SATISFECHO' | 'REQUIERE_AYUDA';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: CurrencyCode;
  inventory: number;
  type: ProductType;
  tags: string[];
  image: string;
  fulfillmentType: FulfillmentType;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Address {
  line1: string;
  line2?: string;
  city: string;
  department: string;
  postalCode: string;
  lat?: number;
  lng?: number;
}

export interface Order {
  id: string;
  userId: string;
  status: OrderStatus;
  createdAt: number;
  subtotal?: number;
  discount?: number;
  total: number;
  currency: CurrencyCode;
  sourceCurrency?: CurrencyCode;
  exchangeRateToBob?: number;
  items: CartItem[];
  address: Address;
  assignedTo?: string;
  paymentMethod?: PaymentMethod;
  digitalDelivery?: DigitalDelivery;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  roles: Array<'customer' | 'admin'>;
  phone?: string;
  whatsapp?: string;
  telegram?: string;
  defaultAddress?: Address;
  paymentMethods?: PaymentMethod[];
}

export interface PaymentMethod {
  id: string;
  type: PaymentMethodType;
  label: string;
  isDefault?: boolean;
  last4?: string;
  holderName?: string;
  cardBrand?: string;
  bankName?: string;
  walletProvider?: string;
  walletPhone?: string;
}

export interface DeliveryEvent {
  id: string;
  status: DigitalDeliveryStatus;
  description: string;
  createdAt: number;
}

export interface DigitalDelivery {
  trackingCode: string;
  productIds: string[];
  status: DigitalDeliveryStatus;
  events: DeliveryEvent[];
  satisfaction: DeliverySatisfaction;
}

export interface Campaign {
  id: string;
  name: string;
  productIds: string[];
  startAt: number;
  endAt: number;
  discountPercent?: number;
  active: boolean;
}

export interface Message {
  id: string;
  orderId: string;
  fromUserId: string;
  toUserId: string;
  text: string;
  createdAt: number;
  seen: boolean;
}
