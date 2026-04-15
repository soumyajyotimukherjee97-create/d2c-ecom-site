import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { FilterBar } from '@/components/shop/FilterBar'

// ─── Mocks ────────────────────────────────────────────────────────────────────

const mockPush = vi.fn()
let mockParams = new URLSearchParams()

vi.mock('next/navigation', () => ({
  useRouter:      () => ({ push: mockPush }),
  useSearchParams: () => mockParams,
  usePathname:    () => '/products',
}))

beforeEach(() => {
  mockPush.mockClear()
  mockParams = new URLSearchParams()
})

// ─── Render ───────────────────────────────────────────────────────────────────

describe('FilterBar — render', () => {
  it('has data-testid="filter-bar"', () => {
    render(<FilterBar />)
    expect(screen.getByTestId('filter-bar')).toBeDefined()
  })

  it('renders all skin type buttons', () => {
    render(<FilterBar />)
    expect(screen.getByText('All')).toBeDefined()
    expect(screen.getByText('Dry')).toBeDefined()
    expect(screen.getByText('Oily')).toBeDefined()
    expect(screen.getByText('Combination')).toBeDefined()
    expect(screen.getByText('Sensitive')).toBeDefined()
  })

  it('renders all concern buttons', () => {
    render(<FilterBar />)
    expect(screen.getByText('Acne')).toBeDefined()
    expect(screen.getByText('Dullness')).toBeDefined()
    expect(screen.getByText('Aging')).toBeDefined()
    expect(screen.getByText('Pores')).toBeDefined()
    expect(screen.getByText('Redness')).toBeDefined()
  })

  it('renders the sort select', () => {
    render(<FilterBar />)
    expect(screen.getByTestId('sort-select')).toBeDefined()
  })
})

// ─── Active state ─────────────────────────────────────────────────────────────

describe('FilterBar — active state', () => {
  it('marks "All" skin type as active when no skin_type param', () => {
    render(<FilterBar />)
    const allBtn = screen.getByTestId('filter-skin-all')
    expect(allBtn.getAttribute('aria-pressed')).toBe('true')
  })

  it('marks the active skin_type button as pressed', () => {
    mockParams = new URLSearchParams('skin_type=dry')
    render(<FilterBar />)
    expect(screen.getByTestId('filter-skin-dry').getAttribute('aria-pressed')).toBe('true')
    expect(screen.getByTestId('filter-skin-all').getAttribute('aria-pressed')).toBe('false')
  })

  it('marks the active concern button as pressed', () => {
    mockParams = new URLSearchParams('concern=acne')
    render(<FilterBar />)
    expect(screen.getByTestId('filter-concern-acne').getAttribute('aria-pressed')).toBe('true')
    expect(screen.getByTestId('filter-concern-dullness').getAttribute('aria-pressed')).toBe('false')
  })

  it('reflects the active sort in the select', () => {
    mockParams = new URLSearchParams('sort=price_asc')
    render(<FilterBar />)
    const select = screen.getByTestId('sort-select') as HTMLSelectElement
    expect(select.value).toBe('price_asc')
  })
})

// ─── Interactions — skin type ─────────────────────────────────────────────────

describe('FilterBar — skin type interactions', () => {
  it('pushes skin_type param when a skin type is clicked', () => {
    render(<FilterBar />)
    fireEvent.click(screen.getByTestId('filter-skin-dry'))
    expect(mockPush).toHaveBeenCalledWith('/products?skin_type=dry')
  })

  it('clears skin_type when "All" is clicked', () => {
    mockParams = new URLSearchParams('skin_type=dry')
    render(<FilterBar />)
    fireEvent.click(screen.getByTestId('filter-skin-all'))
    expect(mockPush).toHaveBeenCalledWith('/products')
  })

  it('toggles off skin_type when the active button is clicked again', () => {
    mockParams = new URLSearchParams('skin_type=dry')
    render(<FilterBar />)
    fireEvent.click(screen.getByTestId('filter-skin-dry'))
    expect(mockPush).toHaveBeenCalledWith('/products')
  })

  it('resets offset when skin_type changes', () => {
    mockParams = new URLSearchParams('offset=20')
    render(<FilterBar />)
    fireEvent.click(screen.getByTestId('filter-skin-oily'))
    expect(mockPush).toHaveBeenCalledWith('/products?skin_type=oily')
  })

  it('preserves existing concern when skin_type changes', () => {
    mockParams = new URLSearchParams('concern=acne')
    render(<FilterBar />)
    fireEvent.click(screen.getByTestId('filter-skin-sensitive'))
    expect(mockPush).toHaveBeenCalledWith('/products?concern=acne&skin_type=sensitive')
  })
})

// ─── Interactions — concern ───────────────────────────────────────────────────

describe('FilterBar — concern interactions', () => {
  it('pushes concern param when a concern is clicked', () => {
    render(<FilterBar />)
    fireEvent.click(screen.getByTestId('filter-concern-aging'))
    expect(mockPush).toHaveBeenCalledWith('/products?concern=aging')
  })

  it('toggles off concern when the active concern is clicked again', () => {
    mockParams = new URLSearchParams('concern=pores')
    render(<FilterBar />)
    fireEvent.click(screen.getByTestId('filter-concern-pores'))
    expect(mockPush).toHaveBeenCalledWith('/products')
  })

  it('preserves existing skin_type when concern changes', () => {
    mockParams = new URLSearchParams('skin_type=oily')
    render(<FilterBar />)
    fireEvent.click(screen.getByTestId('filter-concern-redness'))
    expect(mockPush).toHaveBeenCalledWith('/products?skin_type=oily&concern=redness')
  })
})

// ─── Interactions — sort ──────────────────────────────────────────────────────

describe('FilterBar — sort interactions', () => {
  it('pushes sort param when sort select changes', () => {
    render(<FilterBar />)
    fireEvent.change(screen.getByTestId('sort-select'), { target: { value: 'price_asc' } })
    expect(mockPush).toHaveBeenCalledWith('/products?sort=price_asc')
  })

  it('preserves filters when sort changes', () => {
    mockParams = new URLSearchParams('skin_type=dry&concern=acne')
    render(<FilterBar />)
    fireEvent.change(screen.getByTestId('sort-select'), { target: { value: 'price_desc' } })
    expect(mockPush).toHaveBeenCalledWith('/products?skin_type=dry&concern=acne&sort=price_desc')
  })
})
