import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SignOutButton } from '@/components/account/SignOutButton'
import { createClient } from '@/lib/supabase/browser'

const mockPush = vi.fn()
const mockRefresh = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, refresh: mockRefresh }),
}))

beforeEach(() => {
  mockPush.mockClear()
  mockRefresh.mockClear()
  vi.mocked(createClient).mockClear()
})

describe('SignOutButton', () => {
  it('calls supabase.auth.signOut and redirects home', async () => {
    const signOut = vi.fn().mockResolvedValue({ error: null })
    vi.mocked(createClient).mockReturnValueOnce({
      auth: { signOut },
    } as never)

    const user = userEvent.setup()
    render(<SignOutButton />)
    await user.click(screen.getByTestId('account-sign-out'))

    await waitFor(() => {
      expect(signOut).toHaveBeenCalled()
    })
    expect(mockPush).toHaveBeenCalledWith('/')
    expect(mockRefresh).toHaveBeenCalled()
  })
})
