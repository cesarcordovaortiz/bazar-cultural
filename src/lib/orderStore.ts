import type { Order, OrderStatus } from '../types';

const STORAGE_KEY = 'bazar_orders_v1';
const STORAGE_NOTIFY = `${STORAGE_KEY}_updated`;
const CHANGE_EVENT = 'bazar-orders-changed';

const initialOrders: Order[] = [];

export function readOrders(): Order[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialOrders));
    return initialOrders;
  }

  try {
    return JSON.parse(raw) as Order[];
  } catch {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialOrders));
    return initialOrders;
  }
}

function notify() {
  localStorage.setItem(STORAGE_NOTIFY, String(Date.now()));
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function subscribeOrders(listener: () => void): () => void {
  const handleChange = (): void => listener();
  window.addEventListener(CHANGE_EVENT, handleChange);
  window.addEventListener('storage', handleChange);
  return (): void => {
    window.removeEventListener(CHANGE_EVENT, handleChange);
    window.removeEventListener('storage', handleChange);
  };
}

export function saveOrder(order: Order) {
  const orders = readOrders();
  const exists = orders.find((item) => item.id === order.id);
  if (exists) {
    const updated = orders.map((item) => (item.id === order.id ? order : item));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } else {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([order, ...orders]));
  }
  notify();
}

export function updateOrderStatus(orderId: string, status: OrderStatus) {
  const orders = readOrders();
  const updated = orders.map((order) =>
    order.id === orderId ? { ...order, status } : order,
  );
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  notify();
}

export function getOrderById(orderId: string) {
  return readOrders().find((order) => order.id === orderId);
}
