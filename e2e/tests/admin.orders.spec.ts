import { test, expect } from '@playwright/test';

const orders = [
  {
    id: 'order-123',
    userId: 'user-1',
    status: 'PENDIENTE',
    createdAt: Date.now() - 1000,
    total: 120,
    currency: 'USD',
    items: [{ product: { id: 'prod-1', name: 'Libro de Historia', description: '', price: 28, currency: 'USD', inventory: 12 }, quantity: 1 }],
    address: { line1: 'Calle Falsa 123', city: 'Buenos Aires', department: 'CABA', postalCode: '1000' },
  },
];

test.beforeEach(async ({ page }) => {
  await page.addInitScript((ordersData) => {
    localStorage.setItem('bazar_orders_v1', JSON.stringify(ordersData));
    localStorage.setItem('bazar_auth_token', 'mock-token');
    localStorage.setItem('bazar_user_profile', JSON.stringify({ id: 'admin-1', name: 'Admin', email: 'admin@bazar.test', roles: ['admin'] }));
  }, orders);
});

test('admin orders page renders and updates status', async ({ page }) => {
  await page.goto('/#/admin/orders');
  await expect(page.locator('text=Admin Orders')).toBeVisible();

  await expect(page.getByText('order-123', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'PENDIENTE' }).click();
  await page.getByRole('link', { name: 'Ver detalle' }).click();
  await expect(page.locator('text=Detalle de pedido')).toBeVisible();
  await page.getByRole('button', { name: 'Marcar ACEPTADO' }).click();
  await page.goto('/#/admin/orders');
  await expect(page.locator('text=CANCELAR')).toBeVisible();
});
