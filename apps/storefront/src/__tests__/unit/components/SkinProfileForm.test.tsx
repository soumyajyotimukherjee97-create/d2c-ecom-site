import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SkinProfileForm } from '@/components/account/SkinProfileForm'

const mockRefresh = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: mockRefresh }),
}))

beforeEach(() => {
  mockRefresh.mockClear()
  vi.restoreAllMocks()
})

afterEach(() => {
  vi.unstubAllGlobals()
})

function mockFetch(status: number, payload: unknown) {
  const fetchMock = vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(payload),
  })
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

describe('SkinProfileForm', () => {
  it('renders the current values in read mode', () => {
    render(<SkinProfileForm skinType="combination" concerns={['dullness', 'pores']} />)
    expect(screen.getByTestId('skin-type-value')).toHaveTextContent('Combination')
    // Matter concerns render as individual mono-caps chips — check both are present.
    const concerns = screen.getByTestId('concerns-value')
    expect(concerns).toHaveTextContent(/dullness/i)
    expect(concerns).toHaveTextContent(/pores/i)
  })

  it('renders "Not set" and "None noted" when profile is empty', () => {
    render(<SkinProfileForm skinType={null} concerns={[]} />)
    expect(screen.getByTestId('skin-type-value')).toHaveTextContent('Not set')
    expect(screen.getByTestId('concerns-value')).toHaveTextContent('None noted')
  })

  it('enters edit mode when Edit is clicked', async () => {
    const user = userEvent.setup()
    render(<SkinProfileForm skinType={null} concerns={[]} />)
    await user.click(screen.getByTestId('skin-profile-edit'))
    expect(screen.getByTestId('skin-profile-editor')).toBeInTheDocument()
  })

  it('PATCHes /api/account/profile with selected values and calls router.refresh on success', async () => {
    const fetchMock = mockFetch(200, { skin_type: 'oily', concerns: ['acne'] })
    const user = userEvent.setup()
    render(<SkinProfileForm skinType={null} concerns={[]} />)

    await user.click(screen.getByTestId('skin-profile-edit'))
    await user.click(screen.getByTestId('skin-type-oily'))
    await user.click(screen.getByTestId('concern-acne'))
    await user.click(screen.getByTestId('skin-profile-save'))

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        '/api/account/profile',
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify({ skin_type: 'oily', concerns: ['acne'] }),
        }),
      )
    })
    expect(mockRefresh).toHaveBeenCalled()
  })

  it('shows an error alert when the request fails', async () => {
    mockFetch(500, { error: { message: 'Boom.' } })
    const user = userEvent.setup()
    render(<SkinProfileForm skinType={null} concerns={[]} />)

    await user.click(screen.getByTestId('skin-profile-edit'))
    await user.click(screen.getByTestId('skin-profile-save'))

    expect(await screen.findByTestId('skin-profile-error')).toBeInTheDocument()
    expect(mockRefresh).not.toHaveBeenCalled()
  })

  it('restores original values when Cancel is clicked', async () => {
    const user = userEvent.setup()
    render(<SkinProfileForm skinType="dry" concerns={['acne']} />)

    await user.click(screen.getByTestId('skin-profile-edit'))
    await user.click(screen.getByTestId('skin-type-oily'))
    await user.click(screen.getByTestId('skin-profile-cancel'))

    expect(screen.getByTestId('skin-type-value')).toHaveTextContent('Dry')
  })
})
