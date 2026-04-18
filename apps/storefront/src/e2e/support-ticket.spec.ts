import { test, expect } from '@playwright/test'

test('guest submits a support ticket and sees the confirmation state', async ({ page }) => {
  await page.goto('/support/new')

  await page.getByTestId('input-email').fill('e2e-guest@d2c.test')
  await page.getByTestId('input-order-number').fill('ORD-2026-9999')
  await page.getByTestId('input-subject').fill('Delivery delayed')
  await page.getByTestId('input-body').fill(
    'My order status has not updated in five days. Can you please check with the courier?',
  )

  await page.getByTestId('support-submit').click()

  await expect(page.getByTestId('support-success')).toBeVisible({ timeout: 15_000 })
  // V2 ticket format: TKT-XXXXXXXX (uppercase 8-char UUID prefix).
  await expect(page.getByTestId('support-ticket-id')).toHaveText(/TKT-[0-9A-F]{8}/)
})
