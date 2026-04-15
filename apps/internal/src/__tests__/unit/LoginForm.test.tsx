import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LoginForm } from '@/app/login/LoginForm'
import { createClient } from '@/lib/supabase/browser'
import { pushMock, refreshMock } from '../setup'

type BrowserClient = ReturnType<typeof createClient>
const createClientMock = vi.mocked(createClient)

function mockAuth(signInImpl: () => Promise<unknown>) {
  const signInWithPassword = vi.fn(signInImpl)
  const signOut = vi.fn(async () => ({ error: null }))
  createClientMock.mockReturnValue({
    auth: { signInWithPassword, signOut },
  } as unknown as BrowserClient)
  return { signInWithPassword, signOut }
}

beforeEach(() => {
  pushMock.mockReset()
  refreshMock.mockReset()
  createClientMock.mockReset()
})

describe('LoginForm', () => {
  it('renders an initial error when provided', () => {
    render(<LoginForm initialError="Unauthorised." />)
    expect(screen.getByTestId('staff-login-error')).toHaveTextContent('Unauthorised.')
  })

  it('shows a client-side validation error on invalid email', async () => {
    const user = userEvent.setup()
    render(<LoginForm initialError={null} />)
    await user.type(screen.getByTestId('staff-login-email'), 'not-an-email')
    await user.type(screen.getByTestId('staff-login-password'), 'pw')
    await user.click(screen.getByTestId('staff-login-submit'))
    expect(await screen.findAllByRole('alert')).not.toHaveLength(0)
  })

  it('signs the user out and errors when the account is not staff', async () => {
    const { signOut } = mockAuth(async () => ({
      data: {
        user: {
          id: 'u1',
          email: 'buyer@example.com',
          app_metadata: {},
          user_metadata: {},
        },
      },
      error: null,
    }))

    const user = userEvent.setup()
    render(<LoginForm initialError={null} />)
    await user.type(screen.getByTestId('staff-login-email'), 'buyer@example.com')
    await user.type(screen.getByTestId('staff-login-password'), 'pw')
    await user.click(screen.getByTestId('staff-login-submit'))

    expect(await screen.findByTestId('staff-login-error')).toHaveTextContent(
      /staff access/i,
    )
    expect(signOut).toHaveBeenCalled()
    expect(pushMock).not.toHaveBeenCalled()
  })

  it('redirects to /dashboard when a staff user signs in successfully', async () => {
    mockAuth(async () => ({
      data: {
        user: {
          id: 'u2',
          email: 'ops@example.com',
          app_metadata: { role: 'staff' },
          user_metadata: {},
        },
      },
      error: null,
    }))

    const user = userEvent.setup()
    render(<LoginForm initialError={null} />)
    await user.type(screen.getByTestId('staff-login-email'), 'ops@example.com')
    await user.type(screen.getByTestId('staff-login-password'), 'pw')
    await user.click(screen.getByTestId('staff-login-submit'))

    await waitFor(() => expect(pushMock).toHaveBeenCalledWith('/dashboard'))
    expect(refreshMock).toHaveBeenCalled()
  })

  it('redirects to ?next= target when provided and staff signs in', async () => {
    mockAuth(async () => ({
      data: {
        user: {
          id: 'u3',
          email: 'ops@example.com',
          app_metadata: { role: 'staff' },
          user_metadata: {},
        },
      },
      error: null,
    }))

    const user = userEvent.setup()
    render(<LoginForm initialError={null} redirectTo="/orders" />)
    await user.type(screen.getByTestId('staff-login-email'), 'ops@example.com')
    await user.type(screen.getByTestId('staff-login-password'), 'pw')
    await user.click(screen.getByTestId('staff-login-submit'))

    await waitFor(() => expect(pushMock).toHaveBeenCalledWith('/orders'))
  })

  it('surfaces Supabase auth errors in the alert', async () => {
    mockAuth(async () => ({
      data: { user: null },
      error: { message: 'Invalid login credentials' },
    }))

    const user = userEvent.setup()
    render(<LoginForm initialError={null} />)
    await user.type(screen.getByTestId('staff-login-email'), 'ops@example.com')
    await user.type(screen.getByTestId('staff-login-password'), 'pw')
    await user.click(screen.getByTestId('staff-login-submit'))

    expect(await screen.findByTestId('staff-login-error')).toHaveTextContent(
      'Invalid login credentials',
    )
  })
})
