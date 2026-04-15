import { test, expect } from '@playwright/test'

test.use({ storageState: 'src/e2e/.auth/customer.json' })

test('authenticated customer views their account order history', async ({ page }) => {
  await page.goto('/account')

  // Sidebar identifies the signed-in user.
  await expect(page.getByTestId('account-sidebar')).toBeVisible()
  await expect(page.getByTestId('account-name')).toBeVisible()

  // The orders section renders — either a list of rows or a documented empty state.
  const hasRows  = await page.getByTestId('order-row').first().isVisible().catch(() => false)
  const hasEmpty = await page.getByText(/no orders yet/i).isVisible().catch(() => false)

  expect(hasRows || hasEmpty).toBeTruthy()
})
