import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SignupPage from '@/app/(auth)/signup/page'
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

async function fillValidForm(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByTestId('input-first-name'), 'Aarti')
  await user.type(screen.getByTestId('input-last-name'),  'Kapoor')
  await user.type(screen.getByTestId('input-email'),      'buyer@example.com')
  await user.type(screen.getByTestId('input-password'),   'correcthorse')
  await user.click(screen.getByTestId('input-terms'))
}

describe('SignupPage', () => {
  it('renders name, email, password, and terms fields', () => {
    render(<SignupPage />)
    expect(screen.getByTestId('input-first-name')).toBeInTheDocument()
    expect(screen.getByTestId('input-last-name')).toBeInTheDocument()
    expect(screen.getByTestId('input-email')).toBeInTheDocument()
    expect(screen.getByTestId('input-password')).toBeInTheDocument()
    expect(screen.getByTestId('input-terms')).toBeInTheDocument()
    expect(screen.getByTestId('signup-submit')).toBeInTheDocument()
  })

  it('rejects a password shorter than 8 chars', async () => {
    const user = userEvent.setup()
    render(<SignupPage />)
    await user.type(screen.getByTestId('input-first-name'), 'Aarti')
    await user.type(screen.getByTestId('input-last-name'),  'Kapoor')
    await user.type(screen.getByTestId('input-email'),      'buyer@example.com')
    await user.type(screen.getByTestId('input-password'),   'short')
    await user.click(screen.getByTestId('input-terms'))
    await user.click(screen.getByTestId('signup-submit'))

    expect(await screen.findByText(/at least 8 characters/i)).toBeInTheDocument()
  })

  it('rejects when the terms checkbox is unchecked', async () => {
    const user = userEvent.setup()
    render(<SignupPage />)
    await user.type(screen.getByTestId('input-first-name'), 'Aarti')
    await user.type(screen.getByTestId('input-last-name'),  'Kapoor')
    await user.type(screen.getByTestId('input-email'),      'buyer@example.com')
    await user.type(screen.getByTestId('input-password'),   'correcthorse')
    // intentionally do not check the terms box
    await user.click(screen.getByTestId('signup-submit'))

    expect(await screen.findByText(/agree to the terms/i)).toBeInTheDocument()
  })

  it('redirects when Supabase returns a session, passing names as user_metadata', async () => {
    const signUp = mockSignUp({ data: { user: {}, session: { access_token: 't' } }, error: null })
    const user = userEvent.setup()
    render(<SignupPage />)
    await fillValidForm(user)
    await user.click(screen.getByTestId('signup-submit'))

    await waitFor(() => {
      expect(signUp).toHaveBeenCalledWith({
        email:    'buyer@example.com',
        password: 'correcthorse',
        options:  { data: { first_name: 'Aarti', last_name: 'Kapoor' } },
      })
    })
    expect(mockPush).toHaveBeenCalledWith('/account')
  })

  it('honours ?next= when a session is returned', async () => {
    searchParamsMap = { next: '/account/orders' }
    mockSignUp({ data: { user: {}, session: { access_token: 't' } }, error: null })
    const user = userEvent.setup()
    render(<SignupPage />)
    await fillValidForm(user)
    await user.click(screen.getByTestId('signup-submit'))

    await waitFor(() => expect(mockPush).toHaveBeenCalledWith('/account/orders'))
  })

  it('prefills the email input when ?prefill= is present', () => {
    searchParamsMap = { prefill: 'guest@example.com' }
    render(<SignupPage />)
    const emailInput = screen.getByTestId('input-email') as HTMLInputElement
    expect(emailInput.value).toBe('guest@example.com')
  })

  it('shows verification notice when Supabase returns no session', async () => {
    mockSignUp({ data: { user: {}, session: null }, error: null })
    const user = userEvent.setup()
    render(<SignupPage />)
    await fillValidForm(user)
    await user.click(screen.getByTestId('signup-submit'))

    expect(await screen.findByTestId('signup-verify')).toBeInTheDocument()
    expect(mockPush).not.toHaveBeenCalled()
  })

  it('shows an error alert when signup fails', async () => {
    mockSignUp({ data: { user: null, session: null }, error: { message: 'email already in use' } })
    const user = userEvent.setup()
    render(<SignupPage />)
    await fillValidForm(user)
    await user.click(screen.getByTestId('signup-submit'))

    expect(await screen.findByTestId('signup-api-error')).toBeInTheDocument()
  })
})
