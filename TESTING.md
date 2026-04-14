# TESTING.md — D2C Skincare Platform

Full testing reference. Read this when writing or debugging tests. `CLAUDE.md` has the short version.

---

## Stack

- **Vitest** — unit and component tests
- **React Testing Library** — component rendering and interaction
- **Playwright** — end-to-end browser tests
- **Local Supabase** — integration tests (`supabase start`)

---

## Setup

**Install:**

```bash
pnpm add -D vitest @vitejs/plugin-react @testing-library/react @testing-library/user-event @testing-library/jest-dom
pnpm add -D @playwright/test
```

**`vitest.config.ts`:**

```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/__tests__/setup.ts'],
  },
  resolve: { alias: { '@': path.resolve(__dirname, './src') } },
})
```

**`src/__tests__/setup.ts`:**

```typescript
import '@testing-library/jest-dom'
import { vi } from 'vitest'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), refresh: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/',
}))

vi.mock('@/lib/supabase/browser', () => ({
  createBrowserClient: vi.fn(() => ({
    auth: { getUser: vi.fn(), signOut: vi.fn() },
    from: vi.fn(() => ({ select: vi.fn(), insert: vi.fn(), update: vi.fn() })),
  })),
}))
```

**`.env.test`:**

```
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=test-anon-key
SUPABASE_SERVICE_ROLE_KEY=test-service-role-key
```

---

## Test file locations

```
src/
  __tests__/
    unit/           # Pure logic — schemas, utils, store
    components/     # React component tests
    integration/    # API routes against local Supabase
  e2e/              # Playwright flows
```

---

## Unit tests

Test pure logic with no external dependencies.

**Cover:** Zod schemas · cart store · price formatting · slug sanitiser · order status transition validator · error code mapping

**Example — Zod schema:**

```typescript
import { describe, it, expect } from 'vitest'
import { createOrderSchema } from '@/lib/schemas/order'

describe('createOrderSchema', () => {
  it('accepts a valid payload', () => {
    const result = createOrderSchema.safeParse({
      items: [{ variant_id: 'uuid-1', quantity: 2 }],
      shipping_address: { line1: '12 MG Road', city: 'Bengaluru', state: 'KA', pin: '560001', country: 'IN' },
      contact_email: 'test@example.com',
    })
    expect(result.success).toBe(true)
  })

  it('rejects an empty items array', () => {
    const result = createOrderSchema.safeParse({ items: [], contact_email: 'x@x.com' })
    expect(result.success).toBe(false)
    expect(result.error?.issues[0].path).toContain('items')
  })
})
```

**Example — cart store:**

```typescript
import { describe, it, expect, beforeEach } from 'vitest'
import { useCartStore } from '@/lib/store/cart'

beforeEach(() => useCartStore.getState().clearCart())

describe('cart store', () => {
  it('adds item and computes subtotal', () => {
    useCartStore.getState().addItem(
      { id: 'v1', size_ml: 30, price: 129900, sku: 'SKU-001', stock: 10, is_active: true },
      { id: 'p1', name: 'Brightening Serum', slug: 'brightening-serum', imageUrl: null },
      1
    )
    expect(useCartStore.getState().itemCount()).toBe(1)
    expect(useCartStore.getState().subtotal()).toBe(129900)
  })

  it('increments quantity for duplicate variant', () => {
    const v = { id: 'v1', size_ml: 30, price: 129900, sku: 'SKU-001', stock: 10, is_active: true }
    const p = { id: 'p1', name: 'Serum', slug: 'serum', imageUrl: null }
    useCartStore.getState().addItem(v, p, 1)
    useCartStore.getState().addItem(v, p, 1)
    expect(useCartStore.getState().items[0].quantity).toBe(2)
  })
})
```

---

## Component tests

Render components in isolation. Assert on what the user sees.

**Cover:** ProductCard · IngredientTag · QuantitySelector · CartDrawer · FilterBar · StatusBadge · SkeletonCard · form validation errors

**Do not assert on:** Tailwind class names · animation timing · internal state

**Example — QuantitySelector:**

```typescript
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { QuantitySelector } from '@/components/ui/QuantitySelector'

describe('QuantitySelector', () => {
  it('increments value', () => {
    const onChange = vi.fn()
    render(<QuantitySelector value={1} onChange={onChange} />)
    fireEvent.click(screen.getByRole('button', { name: '+' }))
    expect(onChange).toHaveBeenCalledWith(2)
  })

  it('does not decrement below min', () => {
    const onChange = vi.fn()
    render(<QuantitySelector value={1} onChange={onChange} min={1} />)
    fireEvent.click(screen.getByRole('button', { name: '−' }))
    expect(onChange).not.toHaveBeenCalled()
  })
})
```

---

## Integration tests

Test API routes against a real local Supabase instance.

**Before running:**

```bash
supabase start
supabase db reset    # applies migrations + seeds test data
```

**Cover:** GET /api/products filtering · GET /api/products/[slug] · POST /api/orders (success + 409) · PATCH /api/orders/[id]/status (valid + invalid transitions) · POST /api/support

**Example — POST /api/orders:**

```typescript
import { describe, it, expect, beforeAll } from 'vitest'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

describe('POST /api/orders', () => {
  let variantId: string

  beforeAll(async () => {
    const { data: product } = await supabase.from('products')
      .insert({ name: 'Test Serum', slug: `test-${Date.now()}`, category: 'serum' })
      .select().single()
    const { data: variant } = await supabase.from('product_variants')
      .insert({ product_id: product!.id, size_ml: 30, price: 129900, sku: `T-${Date.now()}`, stock: 2 })
      .select().single()
    variantId = variant!.id
  })

  it('creates order and decrements stock', async () => {
    const res = await fetch('http://localhost:3000/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: [{ variant_id: variantId, quantity: 1 }],
        contact_email: 'test@example.com',
        shipping_address: { line1: '1 MG Road', city: 'Bengaluru', state: 'KA', pin: '560001', country: 'IN' },
      }),
    })
    expect(res.status).toBe(201)
    const { data: v } = await supabase.from('product_variants').select('stock').eq('id', variantId).single()
    expect(v!.stock).toBe(1)
  })

  it('returns 409 when out of stock', async () => {
    await supabase.from('product_variants').update({ stock: 0 }).eq('id', variantId)
    const res = await fetch('http://localhost:3000/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: [{ variant_id: variantId, quantity: 1 }],
        contact_email: 'test@example.com',
        shipping_address: { line1: '1 MG Road', city: 'Bengaluru', state: 'KA', pin: '560001', country: 'IN' },
      }),
    })
    expect(res.status).toBe(409)
    const body = await res.json()
    expect(body.error.code).toBe('INSUFFICIENT_STOCK')
  })
})
```

---

## E2E tests (Playwright)

**`playwright.config.ts`:**

```typescript
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './src/e2e',
  retries: 1,
  use: { baseURL: 'http://localhost:3000', trace: 'on-first-retry' },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['iPhone 13'] } },
  ],
  webServer: { command: 'pnpm dev', url: 'http://localhost:3000', reuseExistingServer: !process.env.CI },
})
```

**6 priority flows — all must pass before merge:**

| File | Flow |
|---|---|
| `browse-and-add-to-cart.spec.ts` | PLP → PDP → add to cart → cart drawer opens |
| `place-order.spec.ts` | Cart → checkout → order confirmation page |
| `account-order-history.spec.ts` | Login → account → view past orders |
| `support-ticket.spec.ts` | Submit support ticket → confirmation |
| `internal-add-product.spec.ts` | Staff login → add product → visible on storefront |
| `internal-process-order.spec.ts` | Staff login → confirm → ship order |

**Example — place order:**

```typescript
import { test, expect } from '@playwright/test'

test('guest places an order end-to-end', async ({ page }) => {
  await page.goto('/')
  await page.evaluate(() => {
    localStorage.setItem('cart', JSON.stringify({
      items: [{ variantId: 'seed-variant-id', sku: 'TEST-001',
        productName: 'Test Serum', size_ml: 30, price: 129900, quantity: 1, imageUrl: null }]
    }))
  })
  await page.goto('/checkout')
  await page.getByLabel(/email/i).fill('e2e@test.com')
  await page.getByLabel(/address/i).fill('1 MG Road')
  await page.getByLabel(/city/i).fill('Bengaluru')
  await page.getByLabel(/pin/i).fill('560001')
  await page.getByRole('button', { name: /continue to payment/i }).click()
  await expect(page).toHaveURL(/\/order\//)
  await expect(page.getByText(/order confirmed/i)).toBeVisible()
})
```

---

## `data-testid` reference

| Element | Value |
|---|---|
| Product card | `product-card` |
| Add to cart button | `add-to-cart` |
| Cart drawer | `cart-drawer` |
| Cart item row | `cart-item` |
| Cart subtotal | `cart-subtotal` |
| Quantity selector | `quantity-selector` |
| Ingredient tag | `ingredient-tag` |
| Science callout | `science-callout` |
| Filter button | `filter-btn-{value}` |
| Status badge | `status-badge` |
| Skeleton card | `skeleton-card` |
| Support form | `support-form` |
| Order row (account) | `order-row` |

---

## Commands

```bash
pnpm vitest                        # unit + component (watch)
pnpm vitest run                    # unit + component (CI)
pnpm vitest run --coverage         # with coverage report
pnpm playwright test               # all E2E
pnpm playwright test --headed      # watch browser
pnpm playwright test --debug       # step debugger
```

---

## Coverage minimums

| Layer | Minimum |
|---|---|
| Unit | 90% |
| Component | 80% |
| Integration (API routes) | 80% |
| E2E critical flows | 100% (all 6 must pass) |

---

## CI pipeline order

```
1. pnpm typecheck              # zero type errors
2. pnpm lint                   # zero warnings
3. pnpm vitest run             # unit + component
4. supabase start && db reset  # spin up local DB
5. pnpm vitest run --integration
6. pnpm playwright test        # E2E
```

Failure at any step stops the pipeline. PRs do not merge with failing tests or coverage below minimums.