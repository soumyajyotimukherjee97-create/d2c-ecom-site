import { test, expect } from '@playwright/test'

/**
 * Pre-loads a cart into localStorage and drives the checkout form end-to-end.
 *
 * Variant id / SKU / price match the seed in `supabase/seed.sql` (Brightening
 * Serum 30ml). Running `supabase db reset` before E2E is required.
 */
const SEEDED_VARIANT = {
  variantId:   'b1000000-0000-0000-0000-000000000001',
  productId:   'a1000000-0000-0000-0000-000000000001',
  sku:         'BRTSERUM-30',
  productName: 'Brightening Serum',
  slug:        'brightening-serum',
  size_ml:     30,
  price:       129900,
  quantity:    1,
  imageUrl:    null,
}

test('guest places an order end-to-end', async ({ page }) => {
  // Seed the Zustand persist store before the app boots.
  // Key must match persist config in lib/store/cart.ts.
  await page.addInitScript((item) => {
    window.localStorage.setItem(
      'form-cart',
      JSON.stringify({ state: { items: [item] }, version: 0 }),
    )
  }, SEEDED_VARIANT)

  await page.goto('/checkout')

  await page.getByTestId('input-email').fill('e2e-guest@d2c.test')
  await page.getByTestId('input-first-name').fill('Priya')
  await page.getByTestId('input-last-name').fill('Singh')
  await page.getByTestId('input-address-line1').fill('1 MG Road')
  await page.getByTestId('input-city').fill('Bengaluru')
  await page.getByTestId('input-pin').fill('560001')
  await page.getByTestId('input-state').selectOption('Karnataka')

  await Promise.all([
    page.waitForURL(/\/order\//, { timeout: 15_000 }),
    page.getByTestId('checkout-submit').click(),
  ])

  await expect(page.getByTestId('confirmation-hero')).toBeVisible()
  await expect(page.getByTestId('confirmation-order-meta')).toContainText(/ORD-/)
  await expect(page.getByTestId('confirmation-order-items')).toBeVisible()
})
