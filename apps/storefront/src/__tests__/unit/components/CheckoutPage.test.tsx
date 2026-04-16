/**
 * Unit tests for the Checkout page component.
 *
 * Tests:
 *  - Rendering: form sections, summary, payment callout
 *  - Validation: required fields, PIN format, email format
 *  - Submission: successful → clearCart + redirect, API error → alert shown
 *  - Empty cart: redirects to /products
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import CheckoutPage from '@/app/(checkout)/checkout/page'
import { useCartStore } from '@/lib/store/cart'
import type { CartItem } from '@/lib/store/cart'

// ─── Mocks ────────────────────────────────────────────────────────────────────

const mockPush    = vi.fn()
const mockReplace = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, replace: mockReplace }),
}))

vi.mock('next/image', () => ({
  default: ({ alt }: { alt: string }) => <span data-testid="img">{alt}</span>,
}))

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const item1: CartItem = {
  variantId:   'v1',
  productId:   'prod-1',
  sku:         'BS-30',
  productName: 'Brightening Serum',
  slug:        'brightening-serum',
  size_ml:     30,
  price:       129900,
  quantity:    1,
  imageUrl:    null,
}

const item2: CartItem = {
  variantId:   'v2',
  productId:   'prod-2',
  sku:         'PTONER-100',
  productName: 'Pore Refining Toner',
  slug:        'pore-refining-toner',
  size_ml:     100,
  price:       89900,
  quantity:    2,
  imageUrl:    null,
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function setCart(items: CartItem[]) {
  useCartStore.setState({ items, isOpen: false })
}

function fillValidForm() {
  fireEvent.change(screen.getByTestId('input-email'), { target: { value: 'buyer@example.com' } })
  fireEvent.change(screen.getByTestId('input-first-name'), { target: { value: 'Priya' } })
  fireEvent.change(screen.getByTestId('input-last-name'),  { target: { value: 'Mehta' } })
  fireEvent.change(screen.getByTestId('input-address-line1'), { target: { value: '12 MG Road' } })
  fireEvent.change(screen.getByTestId('input-city'),  { target: { value: 'Bengaluru' } })
  fireEvent.change(screen.getByTestId('input-pin'),   { target: { value: '560001' } })
  fireEvent.change(screen.getByTestId('input-state'), { target: { value: 'Karnataka' } })
}

// ─── Tests ────────────────────────────────────────────────────────────────────

beforeEach(() => {
  useCartStore.setState({ items: [], isOpen: false })
  localStorage.clear()
  mockPush.mockClear()
  mockReplace.mockClear()
  vi.restoreAllMocks()
})

describe('CheckoutPage — rendering', () => {
  it('renders the minimal checkout navbar with brand and secure label', () => {
    setCart([item1])
    render(<CheckoutPage />)
    expect(screen.getByTestId('checkout-navbar')).toBeInTheDocument()
    expect(screen.getByTestId('checkout-brand')).toHaveTextContent('Form.')
    expect(screen.getByText('🔒 Secure checkout')).toBeInTheDocument()
  })

  it('renders three form sections', () => {
    setCart([item1])
    render(<CheckoutPage />)
    expect(screen.getByText('Contact')).toBeInTheDocument()
    expect(screen.getByText('Shipping address')).toBeInTheDocument()
    expect(screen.getByText('Review and place order')).toBeInTheDocument()
  })

  it('renders the order summary sidebar', () => {
    setCart([item1])
    render(<CheckoutPage />)
    expect(screen.getByTestId('order-summary')).toBeInTheDocument()
  })

  it('renders the COD callout', () => {
    setCart([item1])
    render(<CheckoutPage />)
    expect(screen.getByTestId('payment-callout')).toBeInTheDocument()
    expect(screen.getByText(/Payment to be done at the time of delivery/)).toBeInTheDocument()
  })

  it('renders cart items in the order summary', () => {
    setCart([item1, item2])
    render(<CheckoutPage />)
    // Allow time for mount effect
    const items = screen.getAllByTestId('checkout-summary-item')
    expect(items.length).toBeGreaterThan(0)
  })

  it('shows the submit button', () => {
    setCart([item1])
    render(<CheckoutPage />)
    expect(screen.getByTestId('checkout-submit')).toHaveTextContent(/Place order/)
  })

  it('shows the sign-in link for guests', () => {
    setCart([item1])
    render(<CheckoutPage />)
    expect(screen.getByText(/Sign in/)).toBeInTheDocument()
  })

  it('shows "No account needed · Guest checkout" note', () => {
    setCart([item1])
    render(<CheckoutPage />)
    expect(screen.getByText(/No account needed/)).toBeInTheDocument()
  })
})

describe('CheckoutPage — empty cart redirect', () => {
  it('redirects to /products when cart is empty', async () => {
    setCart([])
    render(<CheckoutPage />)
    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/products')
    })
  })

  it('does not redirect when cart has items', async () => {
    setCart([item1])
    render(<CheckoutPage />)
    // Small delay to allow useEffect to run
    await new Promise((r) => setTimeout(r, 50))
    expect(mockReplace).not.toHaveBeenCalled()
  })
})

describe('CheckoutPage — form validation', () => {
  it('shows email error when submitted without email', async () => {
    setCart([item1])
    render(<CheckoutPage />)
    fireEvent.submit(screen.getByTestId('checkout-form'))
    await waitFor(() => {
      expect(screen.getByText(/valid email/i)).toBeInTheDocument()
    })
  })

  it('shows first name error when first name is missing', async () => {
    setCart([item1])
    render(<CheckoutPage />)
    fireEvent.change(screen.getByTestId('input-email'), { target: { value: 'x@x.com' } })
    fireEvent.submit(screen.getByTestId('checkout-form'))
    await waitFor(() => {
      expect(screen.getByText(/First name is required/i)).toBeInTheDocument()
    })
  })

  it('shows PIN error for non-6-digit input', async () => {
    setCart([item1])
    render(<CheckoutPage />)
    fireEvent.change(screen.getByTestId('input-email'),      { target: { value: 'x@x.com' } })
    fireEvent.change(screen.getByTestId('input-first-name'), { target: { value: 'Priya' } })
    fireEvent.change(screen.getByTestId('input-last-name'),  { target: { value: 'Mehta' } })
    fireEvent.change(screen.getByTestId('input-address-line1'), { target: { value: '12 MG Road' } })
    fireEvent.change(screen.getByTestId('input-city'),  { target: { value: 'Bengaluru' } })
    fireEvent.change(screen.getByTestId('input-pin'),   { target: { value: '123' } }) // too short
    fireEvent.change(screen.getByTestId('input-state'), { target: { value: 'Karnataka' } })
    fireEvent.submit(screen.getByTestId('checkout-form'))
    await waitFor(() => {
      expect(screen.getByText(/6 digits/i)).toBeInTheDocument()
    })
  })

  it('shows state error when state not selected', async () => {
    setCart([item1])
    render(<CheckoutPage />)
    fireEvent.change(screen.getByTestId('input-email'),      { target: { value: 'x@x.com' } })
    fireEvent.change(screen.getByTestId('input-first-name'), { target: { value: 'Priya' } })
    fireEvent.change(screen.getByTestId('input-last-name'),  { target: { value: 'Mehta' } })
    fireEvent.change(screen.getByTestId('input-address-line1'), { target: { value: '12 MG Road' } })
    fireEvent.change(screen.getByTestId('input-city'), { target: { value: 'Bengaluru' } })
    fireEvent.change(screen.getByTestId('input-pin'),  { target: { value: '560001' } })
    // state left as default empty ""
    fireEvent.submit(screen.getByTestId('checkout-form'))
    await waitFor(() => {
      expect(screen.getByText(/State is required/i)).toBeInTheDocument()
    })
  })
})

describe('CheckoutPage — form submission', () => {
  it('POSTs to /api/orders and redirects to /order/[id] on success', async () => {
    setCart([item1])
    const clearCart = vi.spyOn(useCartStore.getState(), 'clearCart')

    global.fetch = vi.fn().mockResolvedValueOnce({
      ok:   true,
      json: () => Promise.resolve({ id: 'order-abc', order_number: 'ORD-2026-00001' }),
    } as Response)

    render(<CheckoutPage />)
    fillValidForm()
    fireEvent.submit(screen.getByTestId('checkout-form'))

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/orders',
        expect.objectContaining({ method: 'POST' }),
      )
      expect(clearCart).toHaveBeenCalled()
      expect(mockPush).toHaveBeenCalledWith('/order/order-abc')
    })
  })

  it('shows API error message when the request fails', async () => {
    setCart([item1])

    global.fetch = vi.fn().mockResolvedValueOnce({
      ok:   false,
      json: () => Promise.resolve({ error: { message: 'One or more variants are out of stock.' } }),
    } as Response)

    render(<CheckoutPage />)
    fillValidForm()
    fireEvent.submit(screen.getByTestId('checkout-form'))

    await waitFor(() => {
      expect(screen.getByTestId('checkout-api-error')).toBeInTheDocument()
      expect(screen.getByText(/out of stock/i)).toBeInTheDocument()
    })
    expect(mockPush).not.toHaveBeenCalled()
  })

  it('shows fallback error on network failure', async () => {
    setCart([item1])

    global.fetch = vi.fn().mockRejectedValueOnce(new Error('Network error'))

    render(<CheckoutPage />)
    fillValidForm()
    fireEvent.submit(screen.getByTestId('checkout-form'))

    await waitFor(() => {
      expect(screen.getByText(/Network error/i)).toBeInTheDocument()
    })
  })

  it('sends correct payload to /api/orders', async () => {
    setCart([item1])

    global.fetch = vi.fn().mockResolvedValueOnce({
      ok:   true,
      json: () => Promise.resolve({ id: 'order-xyz', order_number: 'ORD-2026-00002' }),
    } as Response)

    render(<CheckoutPage />)
    fillValidForm()
    fireEvent.submit(screen.getByTestId('checkout-form'))

    await waitFor(() => expect(global.fetch).toHaveBeenCalled())

    const [, options] = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0]
    const payload = JSON.parse(options.body as string)

    expect(payload.contact_email).toBe('buyer@example.com')
    expect(payload.shipping_address.city).toBe('Bengaluru')
    expect(payload.shipping_address.pin).toBe('560001')
    expect(payload.shipping_address.state).toBe('Karnataka')
    expect(payload.shipping_address.country).toBe('IN')
    expect(payload.items).toEqual([{ variant_id: 'v1', quantity: 1 }])
  })
})
