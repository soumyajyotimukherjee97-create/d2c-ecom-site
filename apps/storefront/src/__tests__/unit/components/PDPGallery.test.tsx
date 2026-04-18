import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PDPGallery } from '@/components/shop/PDPGallery'

describe('PDPGallery', () => {
  it('renders the hero + 4 thumbnail tabs', () => {
    render(<PDPGallery imageUrl={null} name="Brightening Serum" />)
    expect(screen.getByTestId('pdp-gallery')).toBeInTheDocument()
    expect(screen.getByTestId('pdp-gallery-hero')).toBeInTheDocument()
    expect(screen.getAllByRole('tab')).toHaveLength(4)
  })

  it('marks the first thumbnail as selected by default', () => {
    render(<PDPGallery imageUrl={null} name="Brightening Serum" />)
    const first = screen.getByTestId('pdp-gallery-thumb-0')
    expect(first).toHaveAttribute('aria-selected', 'true')
    expect(first).toHaveAttribute('data-selected', 'true')
  })

  it('other thumbs are unselected on initial render', () => {
    render(<PDPGallery imageUrl={null} name="Brightening Serum" />)
    for (const i of [1, 2, 3]) {
      expect(screen.getByTestId(`pdp-gallery-thumb-${i}`)).toHaveAttribute(
        'aria-selected',
        'false',
      )
    }
  })

  it('clicking a thumbnail updates aria-selected', async () => {
    const user = userEvent.setup()
    render(<PDPGallery imageUrl={null} name="Brightening Serum" />)

    await user.click(screen.getByTestId('pdp-gallery-thumb-2'))

    expect(screen.getByTestId('pdp-gallery-thumb-0')).toHaveAttribute('aria-selected', 'false')
    expect(screen.getByTestId('pdp-gallery-thumb-2')).toHaveAttribute('aria-selected', 'true')
  })

  it('thumbnail list has accessible role="tablist" and label', () => {
    render(<PDPGallery imageUrl={null} name="Brightening Serum" />)
    const tablist = screen.getByTestId('pdp-gallery-thumbs')
    expect(tablist).toHaveAttribute('role', 'tablist')
    expect(tablist).toHaveAttribute('aria-label', 'Product images')
  })

  it('renders a striped placeholder when imageUrl is null', () => {
    const { container } = render(<PDPGallery imageUrl={null} name="Brightening Serum" />)
    expect(container.querySelector('.m-ph')).not.toBeNull()
  })
})
