import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test('catalog filters by cultural category and opens a product detail', async ({ page }) => {
  await page.goto('/');

  await page.getByRole('button', { name: 'Arte gráfico', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Serigrafía Mercado Central' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Vinilo Raíces del Altiplano' })).not.toBeVisible();

  await page.getByRole('link', { name: 'Ver detalle' }).first().click();
  await expect(page.getByRole('heading', { name: 'Póster Cultural' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Añadir al carrito' })).toBeVisible();
});

test('customer sees active cultural offers on the catalog page', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('region', { name: 'Ofertas vigentes' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Bienvenida cultural' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Ver productos con oferta antes de que termine' })).toBeVisible();
});

test('offer carousel shows a campaign image, rotates automatically and can be paused', async ({ page }) => {
  await page.goto('/');

  const carousel = page.getByRole('region', { name: 'Ofertas vigentes' });
  const featuredImage = carousel.locator('img');
  await expect(featuredImage).toHaveCount(1);
  await expect.poll(() => featuredImage.evaluate((image) => image.naturalWidth)).toBeGreaterThan(0);
  await expect(page.getByRole('heading', { name: 'Libros y memorias vivas' })).toBeVisible({ timeout: 8_000 });
  await page.getByRole('button', { name: 'Pausar carrusel' }).click();
  await expect(page.getByRole('button', { name: 'Reanudar carrusel' })).toBeVisible();
});

test('catalog is usable on a mobile viewport', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');

  await expect(page.getByRole('navigation', { name: 'Navegación principal' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Tienda de experiencias' })).toBeVisible();
  await expect(page.getByRole('textbox', { name: 'Buscar productos' })).toBeVisible();
});

test('catalog loads an optimized image for each product', async ({ page }) => {
  await page.goto('/');

  const productImages = page.getByRole('img');
  await expect(productImages).toHaveCount(20);
  for (let index = 0; index < 20; index += 1) {
    const image = productImages.nth(index);
    await image.scrollIntoViewIfNeeded();
    await expect.poll(() => image.evaluate((element) => element.naturalWidth)).toBeGreaterThan(0);
  }
});

test('catalog has no automatically detectable accessibility violations', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1, name: 'Tienda de experiencias' })).toBeVisible();

  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});
