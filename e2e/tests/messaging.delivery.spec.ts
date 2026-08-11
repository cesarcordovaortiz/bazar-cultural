import { expect, test } from '@playwright/test';

const customer = { id: 'user-1', name: 'Cliente', email: 'cliente@bazar.test', roles: ['customer'] };
const administrator = { id: 'admin-1', name: 'Admin', email: 'admin@bazar.test', roles: ['admin'] };

test('physical delivery exposes a route map, delivery chat and satisfaction flow', async ({ page }) => {
  await page.addInitScript((profile) => {
    localStorage.setItem('bazar_auth_token', 'mock-token');
    localStorage.setItem('bazar_user_profile', JSON.stringify(profile));
  }, customer);
  await page.goto('/');
  const physicalProduct = page.getByRole('heading', { name: 'Libro de Historia' }).locator('xpath=ancestor::article');
  await physicalProduct.getByRole('button', { name: 'Añadir' }).click();
  await page.getByRole('navigation', { name: 'Navegación principal' }).getByRole('link', { name: /Carrito/ }).click();
  await page.getByRole('link', { name: 'Ir al checkout' }).click();
  await page.getByLabel('Dirección').fill('Calle cultural 123');
  await page.getByLabel('Ciudad').fill('La Paz');
  await page.getByLabel('Departamento').fill('La Paz');
  await page.getByLabel('Código Postal').fill('0000');
  await page.getByRole('button', { name: 'Confirmar pedido' }).click();
  await expect(page.getByRole('heading', { name: 'Pedido confirmado' })).toBeVisible();
  const orderLink = page.getByRole('link', { name: 'Ver seguimiento y mensajes' });
  await orderLink.click();

  await expect(page.getByRole('region', { name: 'Seguimiento de delivery' })).toBeVisible();
  await expect(page.getByRole('region', { name: 'Mapa de monitoreo de entrega' })).toBeVisible();
  await expect(page.getByText('Camila Rojas', { exact: true }).first()).toBeVisible();

  await page.evaluate((profile) => {
    localStorage.setItem('bazar_user_profile', JSON.stringify(profile));
    window.dispatchEvent(new Event('bazar-auth-changed'));
  }, administrator);
  await page.getByRole('button', { name: 'Asignar repartidor' }).click();
  await page.getByRole('button', { name: 'Confirmar recojo' }).click();
  await page.getByRole('button', { name: 'Iniciar ruta' }).click();
  await expect(page.getByText('En ruta', { exact: true }).first()).toBeVisible();
  await page.getByRole('button', { name: 'Confirmar entrega' }).click();

  await page.evaluate((profile) => {
    localStorage.setItem('bazar_user_profile', JSON.stringify(profile));
    window.dispatchEvent(new Event('bazar-auth-changed'));
  }, customer);
  await expect(page.getByText(/Actualización de delivery: La entrega fue confirmada/)).toBeVisible();
  await page.getByRole('button', { name: 'Estoy satisfecho/a' }).click();
  await expect(page.getByRole('status')).toContainText('Gracias por responder');
});

test('administrator receives interaction analytics by stage and type', async ({ page }) => {
  await page.addInitScript((profile) => {
    localStorage.setItem('bazar_auth_token', 'mock-token');
    localStorage.setItem('bazar_user_profile', JSON.stringify(profile));
    localStorage.setItem('bazar_orders_v1', JSON.stringify([{ id: 'order-analytics', userId: 'user-1', status: 'EN_CAMINO', createdAt: Date.now(), total: 20, currency: 'USD', items: [], address: { line1: 'Calle 1', city: 'La Paz', department: 'La Paz', postalCode: '0000' } }]));
    localStorage.setItem('bazar_messages_v1', JSON.stringify([
      { id: 'message-consultation', orderId: 'order-analytics', fromUserId: 'user-1', toUserId: 'admin-1', text: '¿Cuándo se confirma?', createdAt: Date.now() - 2000, seen: false, stage: 'CONSULTA', interactionType: 'CONSULTA' },
      { id: 'message-delivery', orderId: 'order-analytics', fromUserId: 'delivery-1', toUserId: 'user-1', text: 'Ya voy en ruta.', createdAt: Date.now() - 1000, seen: false, stage: 'EN_RUTA', interactionType: 'ENTREGA' },
      { id: 'message-support', orderId: 'order-analytics', fromUserId: 'user-1', toUserId: 'admin-1', text: 'Necesito apoyo con la recepción.', createdAt: Date.now(), seen: false, stage: 'EN_RUTA', interactionType: 'SOPORTE' },
    ]));
  }, administrator);
  await page.goto('/#/messages');

  await expect(page.getByRole('heading', { name: 'Interacciones por etapa' })).toBeVisible();
  await expect(page.getByText('Mayor actividad: En ruta (2)')).toBeVisible();
  await expect(page.getByRole('img', { name: /En ruta: 2/ })).toBeVisible();
  await expect(page.getByLabel('Tipología de interacciones')).toContainText('Delivery');
  await expect(page.getByLabel('Tipología de interacciones')).toContainText('Soporte');
});
