import { test, expect } from '@playwright/test'

test.use({ storageState: 'src/e2e/.auth/staff.json' })

// Unique slug per run so the test is idempotent across reseeded databases.
const runId       = Date.now().toString(36).slice(-6)
const productSlug = `e2e-test-serum-${runId}`
const productName = `E2E Test Serum ${runId}`
const sku         = `E2E-SER-${runId}`

test('staff creates a product and it appears on the storefront PLP', async ({ page }) => {
  // 1. Staff creates the product on the internal console.
  await page.goto('http://localhost:3001/products/new')

  await page.getByTestId('product-name').fill(productName)
  await page.getByTestId('product-slug').fill(productSlug)
  await page.getByTestId('product-description').fill('An end-to-end test product.')
  await page.getByTestId('product-category').selectOption('serum')
  await page.getByLabel(/^dry$/i).check()

  // Fill the single default variant row.
  await page.locator('[data-testid="variant-row-0"] input[type="number"]').nth(0).fill('30')
  await page.locator('[data-testid="variant-row-0"] input[type="number"]').nth(1).fill('49900')
  await page.locator('[data-testid="variant-row-0"] input[type="text"]').fill(sku)
  await page.locator('[data-testid="variant-row-0"] input[type="number"]').nth(2).fill('100')

  await Promise.all([
    page.waitForURL(/\/products\/[0-9a-f-]+\/edit/, { timeout: 20_000 }),
    page.getByTestId('new-product-submit').click(),
  ])

  await expect(page.getByTestId('created-toast')).toBeVisible()

  // 2. The storefront PLP lists the new product (ISR disabled via dynamic=force-dynamic).
  await page.goto('http://localhost:3000/products')
  await expect(page.getByText(productName, { exact: true })).toBeVisible({ timeout: 10_000 })
})
