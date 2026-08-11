import { expect, test } from '@playwright/test';

test('customer can add a product and reach checkout', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('bazar_auth_token', 'mock-token');
    localStorage.setItem('bazar_user_profile', JSON.stringify({ id: 'user-1', name: 'Cliente', email: 'cliente@bazar.test', roles: ['customer'] }));
  });
  await page.goto('/');

  await page.getByRole('button', { name: 'Añadir' }).first().click();
  await page.getByRole('navigation', { name: 'Navegación principal' }).getByRole('link', { name: /Carrito/ }).click();

  await expect(page.getByRole('heading', { name: 'Carrito' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Ir al checkout' })).toBeVisible();

  await page.getByRole('link', { name: 'Ir al checkout' }).click();
  await expect(page.getByRole('heading', { name: 'Checkout' })).toBeVisible();
});

test('an active campaign applies its discount throughout the cart and checkout', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('bazar_auth_token', 'mock-token');
    localStorage.setItem('bazar_user_profile', JSON.stringify({ id: 'user-1', name: 'Cliente', email: 'cliente@bazar.test', roles: ['customer'] }));
  });
  await page.goto('/');

  const firstProduct = page.getByRole('heading', { name: 'Libro de Historia' }).locator('xpath=ancestor::article');
  await expect(firstProduct.getByText('10% de descuento · Bienvenida cultural')).toBeVisible();
  await expect(firstProduct.getByText(/USD\s*25,20/)).toBeVisible();
  await firstProduct.getByRole('button', { name: 'Añadir' }).click();
  await page.getByRole('navigation', { name: 'Navegación principal' }).getByRole('link', { name: /Carrito/ }).click();

  await expect(page.getByText('Descuento de campañas')).toBeVisible();
  await expect(page.getByText(/−USD\s*2,80/)).toBeVisible();
  await expect(page.getByRole('complementary', { name: 'Resumen del carrito' }).getByText(/USD\s*25,20/)).toBeVisible();
  await page.getByRole('link', { name: 'Ir al checkout' }).click();
  await expect(page.getByText('Descuento de campañas')).toBeVisible();
  await expect(page.getByText(/USD\s*25,20/)).toBeVisible();
});

test('checkout confirms a physical order and provides immediate tracking access', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('bazar_auth_token', 'mock-token');
    localStorage.setItem('bazar_user_profile', JSON.stringify({ id: 'user-1', name: 'Cliente', email: 'cliente@bazar.test', roles: ['customer'] }));
  });
  await page.goto('/');
  await page.getByRole('button', { name: 'Añadir' }).first().click();
  await page.getByRole('navigation', { name: 'Navegación principal' }).getByRole('link', { name: /Carrito/ }).click();
  await page.getByRole('link', { name: 'Ir al checkout' }).click();
  await page.getByLabel('Dirección').fill('Calle cultural 123');
  await page.getByLabel('Ciudad').fill('La Paz');
  await page.getByLabel('Departamento').fill('La Paz');
  await page.getByLabel('Código Postal').fill('0000');
  await page.getByRole('button', { name: 'Confirmar pedido' }).click();

  await expect(page.getByRole('heading', { name: 'Pedido confirmado' })).toBeVisible();
  await expect(page.getByText('Entrega a domicilio')).toBeVisible();
  await page.getByRole('link', { name: 'Ver seguimiento y mensajes' }).click();
  await expect(page.getByRole('region', { name: 'Seguimiento de delivery' })).toBeVisible();
});

test('checkout redirects an empty cart to the catalog', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('bazar_auth_token', 'mock-token');
    localStorage.setItem('bazar_user_profile', JSON.stringify({ id: 'user-1', name: 'Cliente', email: 'cliente@bazar.test', roles: ['customer'] }));
  });
  await page.goto('/#/checkout');

  await expect(page.getByRole('heading', { name: 'Tu carrito está vacío' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Volver al catálogo' })).toBeVisible();
});
