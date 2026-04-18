import { test, expect } from '@playwright/test'

test('customer browses PLP, opens a PDP, adds to cart, cart drawer opens', async ({ page }) => {
  await page.goto('/products')

  // V2 split the tile: PLP uses `product-tile`, Home uses `product-card`.
  const firstTile = page.getByTestId('product-tile').first()
  await expect(firstTile).toBeVisible()
  // Click the link explicitly — the `+` button is absolutely positioned on
  // top of the tile, so clicking the tile center without this lands on the
  // button rather than navigating to the PDP.
  await page.getByTestId('product-tile-link').first().click()

  // Landed on a PDP — URL and the add-to-cart button confirm.
  await expect(page).toHaveURL(/\/products\/[a-z0-9-]+/)
  await expect(page.getByTestId('add-to-cart')).toBeVisible()

  // Pick the first variant pill (seeded products have two variants).
  const firstVariant = page.locator('[data-testid^="variant-pill-"]').first()
  await firstVariant.click()

  await page.getByTestId('add-to-cart').click()

  // Cart drawer opens with the item present.
  await expect(page.getByTestId('cart-drawer')).toBeVisible()
  await expect(page.getByTestId('cart-item').first()).toBeVisible()
  await expect(page.getByTestId('cart-subtotal')).toBeVisible()
})
