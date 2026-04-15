import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import LoginPage from '@/app/(auth)/login/page'
import { createClient } from '@/lib/supabase/browser'

const mockPush = vi.fn()
const mockRefresh = vi.fn()
let searchParamsMap: Record<string, string | null> = {}

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, refresh: mockRefresh }),
  useSearchParams: () => ({ get: (k: string) => searchParamsMap[k] ?? null }),
}))

beforeEach(() => {
  mockPush.mockClear()
  mockRefresh.mockClear()
  searchParamsMap = {}
  vi.mocked(createClient).mockClear()
})

describe('LoginPage', () => {
  it('renders email and password inputs and a submit button', () => {
    render(<LoginPage />)
    expect(screen.getByTestId('input-email')).toBeInTheDocument()
    expect(screen.getByTestId('input-password')).toBeInTheDocument()
    expect(screen.getByTestId('login-submit')).toBeInTheDocument()
  })

  it('shows validation errors for empty submit', async () => {
    const user = userEvent.setup()
    render(<LoginPage />)
    await user.click(screen.getByTestId('login-submit'))
    expect(await screen.findAllByRole('alert')).not.toHaveLength(0)
  })

  it('calls signInWithPassword and redirects on success', async () => {
    const signIn = vi.fn().mockResolvedValue({ data: {}, error: null })
    vi.mocked(createClient).mockReturnValueOnce({
      auth: {
        signInWithPassword: signIn,
        getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
        onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
      },
    } as never)

    const user = userEvent.setup()
    render(<LoginPage />)
    await user.type(screen.getByTestId('input-email'), 'buyer@example.com')
    await user.type(screen.getByTestId('input-password'), 'hunter22')
    await user.click(screen.getByTestId('login-submit'))

    await waitFor(() => {
      expect(signIn).toHaveBeenCalledWith({ email: 'buyer@example.com', password: 'hunter22' })
    })
    expect(mockPush).toHaveBeenCalledWith('/account')
  })

  it('redirects to ?next on success when provided', async () => {
    searchParamsMap = { next: '/account/orders' }

    const signIn = vi.fn().mockResolvedValue({ data: {}, error: null })
    vi.mocked(createClient).mockReturnValueOnce({
      auth: {
        signInWithPassword: signIn,
        getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
        onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
      },
    } as never)

    const user = userEvent.setup()
    render(<LoginPage />)
    await user.type(screen.getByTestId('input-email'), 'buyer@example.com')
    await user.type(screen.getByTestId('input-password'), 'hunter22')
    await user.click(screen.getByTestId('login-submit'))

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/account/orders')
    })
  })

  it('shows an error alert when auth fails', async () => {
    const signIn = vi.fn().mockResolvedValue({ data: {}, error: { message: 'bad' } })
    vi.mocked(createClient).mockReturnValueOnce({
      auth: {
        signInWithPassword: signIn,
        getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
        onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
      },
    } as never)

    const user = userEvent.setup()
    render(<LoginPage />)
    await user.type(screen.getByTestId('input-email'), 'buyer@example.com')
    await user.type(screen.getByTestId('input-password'), 'hunter22')
    await user.click(screen.getByTestId('login-submit'))

    expect(await screen.findByTestId('login-api-error')).toBeInTheDocument()
    expect(mockPush).not.toHaveBeenCalled()
  })
})
