import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { ScienceTag } from '@/components/ui/ScienceTag'
import { IngredientTag } from '@/components/ui/IngredientTag'
import { ScienceCallout } from '@/components/ui/ScienceCallout'

describe('ScienceTag', () => {
  it('renders children', () => {
    render(<ScienceTag>Clinically tested</ScienceTag>)
    expect(screen.getByTestId('science-tag')).toHaveTextContent('Clinically tested')
  })

  it('renders as a span', () => {
    render(<ScienceTag>Tag</ScienceTag>)
    expect(screen.getByTestId('science-tag').tagName).toBe('SPAN')
  })

  it('has science-tag CSS class', () => {
    render(<ScienceTag>Tag</ScienceTag>)
    expect(screen.getByTestId('science-tag').className).toContain('science-tag')
  })

  it('forwards additional className', () => {
    render(<ScienceTag className="mt-2">Tag</ScienceTag>)
    expect(screen.getByTestId('science-tag').className).toContain('mt-2')
  })
})

describe('IngredientTag', () => {
  it('renders the ingredient name', () => {
    render(<IngredientTag name="Niacinamide" />)
    expect(screen.getByTestId('ingredient-tag')).toHaveTextContent('Niacinamide')
  })

  it('renders concentration when provided', () => {
    render(<IngredientTag name="Niacinamide" concentration={5} />)
    expect(screen.getByTestId('ingredient-tag')).toHaveTextContent('5%')
  })

  it('does not render concentration when null', () => {
    render(<IngredientTag name="Niacinamide" concentration={null} />)
    expect(screen.getByTestId('ingredient-tag')).not.toHaveTextContent('%')
  })

  it('does not render concentration when omitted', () => {
    render(<IngredientTag name="Niacinamide" />)
    expect(screen.getByTestId('ingredient-tag')).not.toHaveTextContent('%')
  })

  it('has ingredient-tag CSS class', () => {
    render(<IngredientTag name="Hyaluronic Acid" />)
    expect(screen.getByTestId('ingredient-tag').className).toContain('ingredient-tag')
  })
})

describe('ScienceCallout', () => {
  it('renders children', () => {
    render(<ScienceCallout>Study shows 94% improvement</ScienceCallout>)
    expect(screen.getByTestId('science-callout')).toHaveTextContent(
      'Study shows 94% improvement',
    )
  })

  it('renders as a div', () => {
    render(<ScienceCallout>Content</ScienceCallout>)
    expect(screen.getByTestId('science-callout').tagName).toBe('DIV')
  })

  it('has science-callout CSS class', () => {
    render(<ScienceCallout>Content</ScienceCallout>)
    expect(screen.getByTestId('science-callout').className).toContain('science-callout')
  })

  it('renders rich children', () => {
    render(
      <ScienceCallout>
        <strong>Key finding:</strong> SPF 50 protection maintained for 8 hours.
      </ScienceCallout>,
    )
    expect(screen.getByTestId('science-callout')).toHaveTextContent('Key finding:')
  })
})
