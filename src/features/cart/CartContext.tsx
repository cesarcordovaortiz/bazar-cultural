import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import type { CartItem, Product } from '../../types';

interface CartState {
  items: CartItem[];
  addProduct: (product: Product) => void;
  removeProduct: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clear: () => void;
  total: number;
}

const CartContext = createContext<CartState | null>(null);

const STORAGE_KEY = 'bazar_cart_v1';

function loadCart(): CartItem[] {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return [];
  try {
    return JSON.parse(stored) as CartItem[];
  } catch {
    return [];
  }
}

function saveCart(items: CartItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => loadCart());

  useEffect(() => {
    saveCart(items);
  }, [items]);

  const total = useMemo(
    () => items.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
    [items],
  );

  const addProduct = (product: Product) => {
    setItems((current) => {
      const existing = current.find((item) => item.product.id === product.id);
      if (existing) {
        return current.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }
      return [...current, { product, quantity: 1 }];
    });
  };

  const removeProduct = (productId: string) => {
    setItems((current) => current.filter((item) => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    setItems((current) =>
      current
        .map((item) => (item.product.id === productId ? { ...item, quantity } : item))
        .filter((item) => item.quantity > 0),
    );
  };

  const clear = () => setItems([]);

  return (
    <CartContext.Provider value={{ items, addProduct, removeProduct, updateQuantity, clear, total }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
}
