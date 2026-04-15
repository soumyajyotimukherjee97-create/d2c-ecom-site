import { test, expect, request as pwRequest } from '@playwright/test'

test.use({ storageState: 'src/e2e/.auth/staff.json' })

const ORDER_PAYLOAD = {
  items: [
    { variant_id: 'b1000000-0000-0000-0000-000000000001', quantity: 1 },
  ],
  shipping_address: {
    line1: '42 Test Lane', line2: null,
    city:  'Bengaluru', state: 'KA', pin: '560001', country: 'IN',
  },
  contact_email: 'e2e-process@d2c.test',
}

test('staff advances an order through confirmed → processing → shipped', async ({ page }) => {
  // 1. Place an order via the public API so there's something to fulfil.
  const api = await pwRequest.newContext({ baseURL: 'http://localhost:3000' })
  const createRes = await api.post('/api/orders', { data: ORDER_PAYLOAD })
  expect(createRes.ok(), `order create failed: ${await createRes.text()}`).toBeTruthy()
  const order = (await createRes.json()) as { id: string; order_number: string }
  await api.dispose()

  // 2. Staff opens the order in the internal console.
  await page.goto(`http://localhost:3001/orders/${order.id}`)
  await expect(page.getByTestId('order-status-confirmed')).toBeVisible()

  // 3. confirmed → processing
  await page.getByTestId('status-target').selectOption('processing')
  await page.getByTestId('status-submit').click()
  await expect(page.getByTestId('status-success')).toBeVisible({ timeout: 10_000 })
  await expect(page.getByTestId('order-status-processing')).toBeVisible()

  // 4. processing → shipped (tracking + carrier required by the refined schema)
  await page.getByTestId('status-target').selectOption('shipped')
  await page.getByTestId('status-carrier').fill('Bluedart')
  await page.getByTestId('status-tracking').fill(`1Z${order.order_number.replace(/-/g, '')}`)
  await page.getByTestId('status-submit').click()
  await expect(page.getByTestId('status-success')).toBeVisible({ timeout: 10_000 })
  await expect(page.getByTestId('order-status-shipped')).toBeVisible()
})
