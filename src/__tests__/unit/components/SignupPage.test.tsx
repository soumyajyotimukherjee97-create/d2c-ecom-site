import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SignupPage from '@/app/(auth)/signup/page'
import { createClient } from '@/lib/supabase/browser'

const mockPush = vi.fn()
const mockRefresh = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, refresh: mockRefresh }),
  useSearchParams: () => ({ get: () => null }),
}))

beforeEach(() => {
  mockPush.mockClear()
  mockRefresh.mockClear()
  vi.mocked(createClient).mockClear()
})

function mockSignUp(result: { data: { session: unknown; user?: unknown }; error: unknown }) {
  const signUp = vi.fn().mockResolvedValue(result)
  vi.mocked(createClient).mockReturnValueOnce({
    auth: {
      signUp,
      getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
      onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
    },
  } as never)
  return signUp
}

describe('SignupPage', () => {
  it('renders email, password, and confirm inputs', () => {
    render(<SignupPage />)
    expect(screen.getByTestId('input-email')).toBeInTheDocument()
    expect(screen.getByTestId('input-password')).toBeInTheDocument()
    expect(screen.getByTestId('input-confirm-password')).toBeInTheDocument()
    expect(screen.getByTestId('signup-submit')).toBeInTheDocument()
  })

  it('rejects mismatched passwords', async () => {
    const user = userEvent.setup()
    render(<SignupPage />)
    await user.type(screen.getByTestId('input-email'), 'buyer@example.com')
    await user.type(screen.getByTestId('input-password'), 'correcthorse')
    await user.type(screen.getByTestId('input-confirm-password'), 'different1')
    await user.click(screen.getByTestId('signup-submit'))

    expect(await screen.findByText(/passwords do not match/i)).toBeInTheDocument()
  })

  it('rejects a password shorter than 8 chars', async () => {
    const user = userEvent.setup()
    render(<SignupPage />)
    await user.type(screen.getByTestId('input-email'), 'buyer@example.com')
    await user.type(screen.getByTestId('input-password'), 'short')
    await user.type(screen.getByTestId('input-confirm-password'), 'short')
    await user.click(screen.getByTestId('signup-submit'))

    expect(await screen.findByText(/at least 8 characters/i)).toBeInTheDocument()
  })

  it('redirects when Supabase returns a session', async () => {
    const signUp = mockSignUp({ data: { user: {}, session: { access_token: 't' } }, error: null })
    const user = userEvent.setup()
    render(<SignupPage />)
    await user.type(screen.getByTestId('input-email'), 'buyer@example.com')
    await user.type(screen.getByTestId('input-password'), 'correcthorse')
    await user.type(screen.getByTestId('input-confirm-password'), 'correcthorse')
    await user.click(screen.getByTestId('signup-submit'))

    await waitFor(() => {
      expect(signUp).toHaveBeenCalledWith({ email: 'buyer@example.com', password: 'correcthorse' })
    })
    expect(mockPush).toHaveBeenCalledWith('/account')
  })

  it('shows verification notice when Supabase returns no session', async () => {
    mockSignUp({ data: { user: {}, session: null }, error: null })
    const user = userEvent.setup()
    render(<SignupPage />)
    await user.type(screen.getByTestId('input-email'), 'buyer@example.com')
    await user.type(screen.getByTestId('input-password'), 'correcthorse')
    await user.type(screen.getByTestId('input-confirm-password'), 'correcthorse')
    await user.click(screen.getByTestId('signup-submit'))

    expect(await screen.findByTestId('signup-verify')).toBeInTheDocument()
    expect(mockPush).not.toHaveBeenCalled()
  })

  it('shows an error alert when signup fails', async () => {
    mockSignUp({ data: { user: null, session: null }, error: { message: 'email already in use' } })
    const user = userEvent.setup()
    render(<SignupPage />)
    await user.type(screen.getByTestId('input-email'), 'buyer@example.com')
    await user.type(screen.getByTestId('input-password'), 'correcthorse')
    await user.type(screen.getByTestId('input-confirm-password'), 'correcthorse')
    await user.click(screen.getByTestId('signup-submit'))

    expect(await screen.findByTestId('signup-api-error')).toBeInTheDocument()
  })
})
