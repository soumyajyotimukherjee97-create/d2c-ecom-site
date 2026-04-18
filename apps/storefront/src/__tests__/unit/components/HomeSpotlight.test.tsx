import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HomeSpotlight } from '@/components/shop/HomeSpotlight'

describe('HomeSpotlight', () => {
  it('renders the section kicker and headline', () => {
    render(<HomeSpotlight />)
    expect(screen.getByTestId('home-spotlight')).toBeDefined()
    expect(screen.getByText(/§ III — Know your ingredient/i)).toBeDefined()
  })

  it('renders 4 ingredient tabs in a tablist', () => {
    render(<HomeSpotlight />)
    const tablist = screen.getByTestId('spotlight-tablist')
    expect(tablist).toBeDefined()
    expect(screen.getAllByRole('tab')).toHaveLength(4)
  })

  it('marks niacinamide selected by default', () => {
    render(<HomeSpotlight />)
    const tab = screen.getByTestId('spotlight-tab-niacinamide')
    expect(tab).toHaveAttribute('aria-selected', 'true')
  })

  it('counter reads "1 / 4" by default', () => {
    render(<HomeSpotlight />)
    expect(screen.getByTestId('spotlight-counter')).toHaveTextContent('1 / 4')
  })

  it('shows niacinamide content by default', () => {
    render(<HomeSpotlight />)
    const content = screen.getByTestId('spotlight-content')
    expect(content).toHaveTextContent(/Niacinamide/)
    expect(content).toHaveTextContent(/2%/)
  })

  it('switches content and counter when another tab is clicked', async () => {
    const user = userEvent.setup()
    render(<HomeSpotlight />)

    await user.click(screen.getByTestId('spotlight-tab-retinal'))

    expect(screen.getByTestId('spotlight-tab-retinal')).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByTestId('spotlight-tab-niacinamide')).toHaveAttribute('aria-selected', 'false')
    expect(screen.getByTestId('spotlight-counter')).toHaveTextContent('2 / 4')
    expect(screen.getByTestId('spotlight-content')).toHaveTextContent(/Retinaldehyde/)
    expect(screen.getByTestId('spotlight-content')).toHaveTextContent(/0\.05%/)
  })

  it('each tab shows its zero-padded index label', () => {
    render(<HomeSpotlight />)
    const tabs = screen.getAllByRole('tab')
    expect(tabs[0]).toHaveTextContent('01')
    expect(tabs[1]).toHaveTextContent('02')
    expect(tabs[2]).toHaveTextContent('03')
    expect(tabs[3]).toHaveTextContent('04')
  })
})
