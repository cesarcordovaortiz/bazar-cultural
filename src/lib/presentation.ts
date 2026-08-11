import type { ProductType } from '../types';

export const PRODUCT_TYPE_OPTIONS: Array<{ value: ProductType; label: string }> = [
  { value: 'book', label: 'Libros' },
  { value: 'music', label: 'Música' },
  { value: 'movie', label: 'Cine y audiovisual' },
  { value: 'print', label: 'Arte gráfico' },
  { value: 'painting', label: 'Pintura' },
  { value: 'sculpture', label: 'Escultura' },
];

const PRODUCT_TYPE_LABELS = Object.fromEntries(PRODUCT_TYPE_OPTIONS.map(({ value, label }) => [value, label])) as Record<ProductType, string>;

export function getProductTypeLabel(type: ProductType): string {
  return PRODUCT_TYPE_LABELS[type];
}

export function formatCurrency(value: number, currency = 'USD'): string {
  return new Intl.NumberFormat('es-BO', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}
