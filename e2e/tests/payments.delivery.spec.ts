import { expect, test } from '@playwright/test';

function customerProfile() {
  return { id: 'user-1', name: 'Cliente', email: 'cliente@bazar.test', roles: ['customer'] };
}

function administratorProfile() {
  return { id: 'admin-1', name: 'Admin', email: 'admin@bazar.test', roles: ['admin'] };
}

test('customer can switch from USD to BOB using the published BCB rate', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Moneda de visualización').selectOption('BOB');

  const firstProduct = page.getByRole('heading', { name: 'Libro de Historia' }).locator('xpath=ancestor::article');
  await expect(firstProduct.getByText(/Bs\s*296,60/)).toBeVisible();
  await expect(page.getByText('Banco Central de Bolivia')).toBeVisible();
});

test('profile shows standardized examples for each payment method', async ({ page }) => {
  await page.addInitScript((profile) => {
    localStorage.setItem('bazar_auth_token', 'mock-token');
    localStorage.setItem('bazar_user_profile', JSON.stringify(profile));
  }, customerProfile());
  await page.goto('/#/profile');

  await page.getByLabel('Modalidad').selectOption('transfer');
  await expect(page.getByText('Ejemplo: Banco Unión · cuenta terminada en 1234.')).toBeVisible();
  await expect(page.getByRole('textbox', { name: 'Titular de cuenta' })).toBeVisible();
  await expect(page.getByRole('textbox', { name: 'Entidad bancaria' })).toBeVisible();
  await expect(page.getByRole('textbox', { name: 'Últimos 4 dígitos' })).toBeVisible();
});

test('digital delivery sends status messages and captures customer satisfaction', async ({ page }) => {
  await page.addInitScript((profile) => {
    localStorage.setItem('bazar_auth_token', 'mock-token');
    localStorage.setItem('bazar_user_profile', JSON.stringify(profile));
  }, customerProfile());
  await page.goto('/');
  await page.getByRole('button', { name: 'Música', exact: true }).click();

  const digitalProduct = page.getByRole('heading', { name: 'Sesión Acústica del Sur' }).locator('xpath=ancestor::article');
  await digitalProduct.getByRole('button', { name: 'Añadir' }).click();
  await page.getByRole('navigation', { name: 'Navegación principal' }).getByRole('link', { name: /Carrito/ }).click();
  await page.getByRole('link', { name: 'Ir al checkout' }).click();
  await page.getByLabel('Dirección').fill('Calle cultural 123');
  await page.getByLabel('Ciudad').fill('La Paz');
  await page.getByLabel('Departamento').fill('La Paz');
  await page.getByLabel('Código Postal').fill('0000');
  await page.getByRole('button', { name: 'Confirmar pedido' }).click();
  await expect(page.getByRole('heading', { name: 'Mis pedidos' })).toBeVisible();

  const orderLink = page.locator('a[href*="/orders/order-"]').first();
  const orderHref = await orderLink.getAttribute('href');
  expect(orderHref).toBeTruthy();

  await page.evaluate((profile) => {
    localStorage.setItem('bazar_auth_token', 'mock-token');
    localStorage.setItem('bazar_user_profile', JSON.stringify(profile));
  }, administratorProfile());
  await page.goto(orderHref!);
  await expect(page.getByRole('region', { name: 'Seguimiento de entrega digital' })).toBeVisible();
  await page.getByRole('button', { name: 'Preparar acceso' }).click();
  await page.getByRole('button', { name: 'Notificar acceso enviado' }).click();
  await page.getByRole('button', { name: 'Confirmar entrega' }).click();
  await expect(page.getByRole('region', { name: 'Seguimiento de entrega digital' }).getByText('Entrega confirmada', { exact: true }).first()).toBeVisible();

  await page.evaluate((profile) => {
    localStorage.setItem('bazar_auth_token', 'mock-token');
    localStorage.setItem('bazar_user_profile', JSON.stringify(profile));
    window.dispatchEvent(new Event('bazar-auth-changed'));
  }, customerProfile());
  await expect(page.getByText(/Actualización de entrega digital: La entrega digital fue confirmada/)).toBeVisible();
  await page.getByRole('button', { name: 'Estoy satisfecho/a' }).click();
  await expect(page.getByRole('status')).toContainText('Gracias por responder');
});
