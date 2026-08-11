export type OrderStatus = 'PENDIENTE' | 'ACEPTADO' | 'EN_CAMINO' | 'ENTREGADO' | 'CANCELADO';
export type ProductType = 'book' | 'music' | 'movie' | 'print' | 'painting' | 'sculpture';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  inventory: number;
  type: ProductType;
  tags: string[];
  image: string;
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
  currency: string;
  items: CartItem[];
  address: Address;
  assignedTo?: string;
  paymentMethod?: PaymentMethod;
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
  type: 'card' | 'transfer' | 'cash' | 'wallet';
  label: string;
  last4?: string;
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
