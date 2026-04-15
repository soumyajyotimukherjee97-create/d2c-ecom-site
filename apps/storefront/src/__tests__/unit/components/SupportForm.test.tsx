import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SupportForm } from '@/components/shop/SupportForm'

const ORDER_UUID = 'a0000000-0000-0000-0000-000000000001'

function mockFetchOk(payload: unknown) {
  const fetchMock = vi.fn().mockResolvedValue({
    ok: true,
    status: 201,
    json: () => Promise.resolve(payload),
  })
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

function mockFetchErr(status: number, payload: unknown) {
  const fetchMock = vi.fn().mockResolvedValue({
    ok: false,
    status,
    json: () => Promise.resolve(payload),
  })
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

beforeEach(() => {
  vi.restoreAllMocks()
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('SupportForm — guest', () => {
  it('renders email input and order number text input', () => {
    render(<SupportForm userEmail={null} orders={[]} />)
    expect(screen.getByTestId('input-email')).toBeInTheDocument()
    expect(screen.getByTestId('input-order-number')).toBeInTheDocument()
    expect(screen.queryByTestId('input-order-select')).not.toBeInTheDocument()
  })

  it('requires email, subject, and body', async () => {
    const user = userEvent.setup()
    render(<SupportForm userEmail={null} orders={[]} />)
    await user.click(screen.getByTestId('support-submit'))
    expect(await screen.findAllByRole('alert')).not.toHaveLength(0)
  })

  it('submits with guest_email and prepends the order number to body', async () => {
    const fetchMock = mockFetchOk({
      id: 'abcdef12-0000-0000-0000-000000000000',
      status: 'open',
      created_at: '2026-04-15T00:00:00Z',
    })

    const user = userEvent.setup()
    render(<SupportForm userEmail={null} orders={[]} />)

    await user.type(screen.getByTestId('input-email'), 'buyer@example.com')
    await user.type(screen.getByTestId('input-order-number'), 'ORD-2026-0001')
    await user.type(screen.getByTestId('input-subject'), 'Damaged bottle')
    await user.type(screen.getByTestId('input-body'), 'The bottle arrived cracked.')
    await user.click(screen.getByTestId('support-submit'))

    await waitFor(() => expect(fetchMock).toHaveBeenCalled())

    const [, init] = fetchMock.mock.calls[0]
    const body = JSON.parse(init.body)
    expect(body.guest_email).toBe('buyer@example.com')
    expect(body.order_id).toBeUndefined()
    expect(body.subject).toBe('Damaged bottle')
    expect(body.body).toContain('Order reference: ORD-2026-0001')
    expect(body.body).toContain('The bottle arrived cracked.')
  })

  it('shows the success state with ticket id prefix after submit', async () => {
    mockFetchOk({ id: 'abcdef12-0000-0000-0000-000000000000', status: 'open', created_at: 'x' })
    const user = userEvent.setup()
    render(<SupportForm userEmail={null} orders={[]} />)

    await user.type(screen.getByTestId('input-email'), 'buyer@example.com')
    await user.type(screen.getByTestId('input-subject'), 'Hello')
    await user.type(screen.getByTestId('input-body'), 'Message body here.')
    await user.click(screen.getByTestId('support-submit'))

    expect(await screen.findByTestId('support-success')).toBeInTheDocument()
    expect(screen.getByTestId('support-ticket-id')).toHaveTextContent('#abcdef12')
  })

  it('renders an error alert when the API fails', async () => {
    mockFetchErr(500, { error: { message: 'Boom' } })
    const user = userEvent.setup()
    render(<SupportForm userEmail={null} orders={[]} />)

    await user.type(screen.getByTestId('input-email'), 'buyer@example.com')
    await user.type(screen.getByTestId('input-subject'), 'Hello')
    await user.type(screen.getByTestId('input-body'), 'Message body here.')
    await user.click(screen.getByTestId('support-submit'))

    expect(await screen.findByTestId('support-api-error')).toBeInTheDocument()
    expect(screen.queryByTestId('support-success')).not.toBeInTheDocument()
  })
})

describe('SupportForm — authenticated', () => {
  it('renders email as read-only and order dropdown', () => {
    render(
      <SupportForm
        userEmail="priya@example.com"
        orders={[{ id: ORDER_UUID, order_number: 'ORD-2026-0001' }]}
      />,
    )
    expect(screen.getByTestId('support-email-readonly')).toHaveTextContent('priya@example.com')
    expect(screen.queryByTestId('input-email')).not.toBeInTheDocument()
    expect(screen.getByTestId('input-order-select')).toBeInTheDocument()
  })

  it('sends order_id when an order is selected from the dropdown', async () => {
    const fetchMock = mockFetchOk({ id: 'aaaaaaaa-0000-0000-0000-000000000000', status: 'open', created_at: 'x' })

    const user = userEvent.setup()
    render(
      <SupportForm
        userEmail="priya@example.com"
        orders={[{ id: ORDER_UUID, order_number: 'ORD-2026-0001' }]}
      />,
    )

    await user.selectOptions(screen.getByTestId('input-order-select'), ORDER_UUID)
    await user.type(screen.getByTestId('input-subject'), 'Question')
    await user.type(screen.getByTestId('input-body'), 'Anything I should know?')
    await user.click(screen.getByTestId('support-submit'))

    await waitFor(() => expect(fetchMock).toHaveBeenCalled())
    const body = JSON.parse(fetchMock.mock.calls[0]![1].body)
    expect(body.order_id).toBe(ORDER_UUID)
    expect(body.guest_email).toBeUndefined()
  })

  it('omits order_id when no order is selected', async () => {
    const fetchMock = mockFetchOk({ id: 'aaaaaaaa-0000-0000-0000-000000000000', status: 'open', created_at: 'x' })

    const user = userEvent.setup()
    render(<SupportForm userEmail="priya@example.com" orders={[]} />)

    await user.type(screen.getByTestId('input-subject'), 'Question')
    await user.type(screen.getByTestId('input-body'), 'Anything I should know?')
    await user.click(screen.getByTestId('support-submit'))

    await waitFor(() => expect(fetchMock).toHaveBeenCalled())
    const body = JSON.parse(fetchMock.mock.calls[0]![1].body)
    expect(body.order_id).toBeUndefined()
    expect(body.guest_email).toBeUndefined()
  })
})

describe('SupportForm — character counter', () => {
  it('updates the body counter as the user types', async () => {
    const user = userEvent.setup()
    render(<SupportForm userEmail={null} orders={[]} />)

    expect(screen.getByTestId('body-counter')).toHaveTextContent('0 / 5,000')
    await user.type(screen.getByTestId('input-body'), 'hello')
    expect(screen.getByTestId('body-counter')).toHaveTextContent('5 / 5,000')
  })
})
