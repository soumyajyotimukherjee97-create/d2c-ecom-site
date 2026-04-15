import { describe, it, expect } from 'vitest'
import {
  renderOrderConfirmation,
  renderOrderShipped,
  renderOrderDelivered,
  renderTicketOpened,
  renderTicketResolved,
} from '../index'

// ─── renderOrderConfirmation ──────────────────────────────────────────────────

describe('renderOrderConfirmation', () => {
  const base = {
    order_number:  'ORD-2026-0001',
    contact_email: 'buyer@example.com',
    items: [
      { product_name: 'Brightening Serum', variant_sku: 'SER-30', quantity: 2, line_total: 99800 },
    ],
    subtotal:       99800,
    shipping_total: 0,
    total:          99800,
    shipping_address: { line1: '42 Lane', line2: null, city: 'Mumbai', state: 'MH', pin: '400001' },
  }

  it('includes the order number and INR-formatted total', () => {
    const { subject, html } = renderOrderConfirmation(base)
    expect(subject).toContain('ORD-2026-0001')
    expect(html).toContain('ORD-2026-0001')
    expect(html).toContain('₹998')
  })

  it('lists each line item with SKU and quantity', () => {
    const { html } = renderOrderConfirmation(base)
    expect(html).toContain('Brightening Serum')
    expect(html).toContain('SER-30')
    expect(html).toContain('Qty 2')
  })

  it('renders "Free" when shipping_total is zero', () => {
    const { html } = renderOrderConfirmation(base)
    expect(html).toContain('Free')
  })

  it('HTML-escapes user-supplied strings to prevent injection', () => {
    const { html } = renderOrderConfirmation({
      ...base,
      items: [{ product_name: '<script>x</script>', variant_sku: 'X', quantity: 1, line_total: 100 }],
    })
    expect(html).not.toContain('<script>x</script>')
    expect(html).toContain('&lt;script&gt;x&lt;/script&gt;')
  })

  it('omits the CTA when no order_url is provided', () => {
    const { html } = renderOrderConfirmation(base)
    expect(html).not.toContain('View order')
  })

  it('renders the CTA when order_url is provided', () => {
    const { html } = renderOrderConfirmation({ ...base, order_url: 'https://shop.example/order/abc' })
    expect(html).toContain('View order')
    expect(html).toContain('https://shop.example/order/abc')
  })
})

// ─── renderOrderShipped ──────────────────────────────────────────────────────

describe('renderOrderShipped', () => {
  it('includes carrier and tracking id', () => {
    const { subject, html } = renderOrderShipped({
      order_number: 'ORD-2026-0001',
      carrier:      'Bluedart',
      tracking_id:  '1Z999',
    })
    expect(subject).toContain('ORD-2026-0001')
    expect(html).toContain('Bluedart')
    expect(html).toContain('1Z999')
  })

  it('renders tracking CTA when tracking_url is present', () => {
    const { html } = renderOrderShipped({
      order_number: 'ORD-2026-0001',
      carrier:      'Bluedart',
      tracking_id:  '1Z999',
      tracking_url: 'https://track.example/1Z999',
    })
    expect(html).toContain('Track package')
    expect(html).toContain('https://track.example/1Z999')
  })
})

// ─── renderOrderDelivered ────────────────────────────────────────────────────

describe('renderOrderDelivered', () => {
  it('includes order number', () => {
    const { subject, html } = renderOrderDelivered({ order_number: 'ORD-2026-0001' })
    expect(subject).toContain('ORD-2026-0001')
    expect(html).toContain('ORD-2026-0001')
  })

  it('renders both CTAs when both URLs are present', () => {
    const { html } = renderOrderDelivered({
      order_number: 'ORD-2026-0001',
      review_url:  'https://shop.example/review',
      reorder_url: 'https://shop.example/reorder',
    })
    expect(html).toContain('Leave a review')
    expect(html).toContain('Reorder')
  })
})

// ─── renderTicketOpened ──────────────────────────────────────────────────────

describe('renderTicketOpened', () => {
  it('includes truncated ticket id in subject + body', () => {
    const { subject, html } = renderTicketOpened({
      ticket_id: 'abcdef12-0000-0000-0000-000000000000',
      subject:   'Damaged bottle',
    })
    expect(subject).toContain('#abcdef12')
    expect(html).toContain('#abcdef12')
    expect(html).toContain('Damaged bottle')
  })

  it('defaults SLA to 24 hours when not provided', () => {
    const { html } = renderTicketOpened({
      ticket_id: 'abcdef12-0000-0000-0000-000000000000',
      subject:   'x',
    })
    expect(html).toContain('24 hours')
  })
})

// ─── renderTicketResolved ────────────────────────────────────────────────────

describe('renderTicketResolved', () => {
  it('includes ticket id + subject', () => {
    const { subject, html } = renderTicketResolved({
      ticket_id: 'abcdef12-0000-0000-0000-000000000000',
      subject:   'Damaged bottle',
    })
    expect(subject).toContain('#abcdef12')
    expect(html).toContain('Damaged bottle')
  })

  it('renders the resolution_summary when provided', () => {
    const { html } = renderTicketResolved({
      ticket_id: 'abcdef12-0000-0000-0000-000000000000',
      subject:   'x',
      resolution_summary: 'Replacement shipped today.',
    })
    expect(html).toContain('Replacement shipped today.')
  })
})
