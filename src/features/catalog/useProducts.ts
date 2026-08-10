import { useQuery } from '@tanstack/react-query';
import { products } from '../../lib/products';
import type { Product } from '../../types';

async function fetchProducts(): Promise<Product[]> {
  return products;
}

export function useProducts() {
  return useQuery({ queryKey: ['products'], queryFn: fetchProducts, staleTime: 60_000 });
}
