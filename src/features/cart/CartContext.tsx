import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import { useActiveCampaigns } from '../campaigns/useActiveCampaigns';
import { calculateCartPricing } from '../../lib/pricing';
import type { Campaign, CartItem, Product } from '../../types';

interface CartState {
  items: CartItem[];
  addProduct: (product: Product) => void;
  removeProduct: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clear: () => void;
  activeCampaigns: Campaign[];
  subtotal: number;
  discount: number;
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
  const activeCampaigns = useActiveCampaigns();

  useEffect(() => {
    saveCart(items);
  }, [items]);

  const pricing = useMemo(() => calculateCartPricing(items, activeCampaigns), [items, activeCampaigns]);

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
    <CartContext.Provider value={{ items, addProduct, removeProduct, updateQuantity, clear, activeCampaigns, ...pricing }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
}
