import { expect, test } from '@playwright/test';

test('admin can create a local campaign', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('bazar_auth_token', 'mock-token');
    localStorage.setItem('bazar_user_profile', JSON.stringify({ id: 'admin-1', name: 'Admin', email: 'admin@bazar.test', roles: ['admin'] }));
  });
  await page.goto('/#/admin/campaigns');

  await page.getByRole('textbox', { name: 'Nombre' }).fill('Semana del arte');
  await page.getByRole('checkbox', { name: 'Póster Cultural' }).check();
  await page.getByRole('button', { name: 'Crear campaña' }).click();

  const campaign = page.getByRole('heading', { name: 'Semana del arte' }).locator('xpath=ancestor::article');
  await expect(campaign).toBeVisible();
  await expect(campaign.getByText('2 productos incluidos')).toBeVisible();
});

test('admin cannot create a campaign that ends before it starts', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('bazar_auth_token', 'mock-token');
    localStorage.setItem('bazar_user_profile', JSON.stringify({ id: 'admin-1', name: 'Admin', email: 'admin@bazar.test', roles: ['admin'] }));
  });
  await page.goto('/#/admin/campaigns');

  await page.getByRole('textbox', { name: 'Nombre' }).fill('Campaña inválida');
  await page.getByLabel('Inicio').fill('2026-12-10T12:00');
  await page.getByLabel('Fin').fill('2026-12-09T12:00');
  await page.getByRole('button', { name: 'Crear campaña' }).click();

  await expect(page.getByRole('alert')).toHaveText('La fecha de fin debe ser posterior al inicio');
  await expect(page.getByRole('heading', { name: 'Campaña inválida' })).not.toBeVisible();
});

test('demo administrator access opens the campaigns UI', async ({ page }) => {
  await page.goto('/#/login');
  await page.getByRole('button', { name: 'Ver administración' }).click();

  await expect(page.getByRole('heading', { name: 'Campañas culturales' })).toBeVisible();
});

test('customer can send an order message', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('bazar_orders_v1', JSON.stringify([{
      id: 'order-message', userId: 'user-1', status: 'PENDIENTE', createdAt: Date.now(), total: 28, currency: 'USD',
      items: [{ product: { id: 'prod-1', name: 'Libro de Historia', description: '', price: 28, currency: 'USD', inventory: 12 }, quantity: 1 }],
      address: { line1: 'Calle 1', city: 'La Paz', department: 'La Paz', postalCode: '0000' },
    }]));
    localStorage.setItem('bazar_auth_token', 'mock-token');
    localStorage.setItem('bazar_user_profile', JSON.stringify({ id: 'user-1', name: 'Cliente', email: 'cliente@bazar.test', roles: ['customer'] }));
  });
  await page.goto('/#/orders/order-message');

  await page.getByRole('textbox', { name: 'Mensaje' }).fill('¿Cuándo llegará mi pedido?');
  await page.getByRole('button', { name: 'Enviar' }).click();

  await expect(page.getByText('¿Cuándo llegará mi pedido?')).toBeVisible();
});

test('customer can access the messages center from navigation', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('bazar_auth_token', 'mock-token');
    localStorage.setItem('bazar_user_profile', JSON.stringify({ id: 'user-1', name: 'Cliente', email: 'cliente@bazar.test', roles: ['customer'] }));
    localStorage.setItem('bazar_orders_v1', JSON.stringify([{
      id: 'order-center', userId: 'user-1', status: 'ACEPTADO', createdAt: Date.now(), total: 20, currency: 'USD', items: [],
      address: { line1: 'Calle 1', city: 'La Paz', department: 'La Paz', postalCode: '0000' },
    }]));
  });
  await page.goto('/');
  await page.getByRole('link', { name: 'Mensajes' }).click();

  await expect(page.getByRole('heading', { name: 'Centro de mensajes' })).toBeVisible();
  await expect(page.getByRole('textbox', { name: 'Mensaje' })).toBeVisible();
});
