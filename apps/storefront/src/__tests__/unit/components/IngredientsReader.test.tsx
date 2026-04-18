import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { IngredientsReader } from '@/components/shop/IngredientsReader'
import type { IngredientEntry } from '@/lib/ingredients/catalogue'
import type { Essay } from '@/lib/ingredients/essays'

const fixtureIngredients: IngredientEntry[] = [
  {
    sym: 'NIA', n: '01', name: 'Niacinamide',
    class: 'Active', fn: 'Barrier · Sebum',
    formula: 'C₆H₆N₂O', mw: 122.12, conc: '4.0%', pH: '5.5',
    tol: { dry: '●', oily: '●', comb: '●', sens: '●', reac: '●' },
    origin: 'Synthesised · EU',
    used: ['The Corrective'],
    blurb: 'b', evidence: 'e',
  },
  {
    sym: 'RET', n: '02', name: 'Retinaldehyde',
    class: 'Active', fn: 'Renewal',
    formula: 'C₂₀H₂₈O', mw: 284.44, conc: '0.05%', pH: '5.5',
    tol: { dry: '◐', oily: '●', comb: '●', sens: '◐', reac: '○' },
    origin: 'Encapsulated · CH',
    used: ['Night Repair'],
    blurb: 'b', evidence: 'e',
  },
  {
    sym: 'HYA', n: '03', name: 'Hyaluronic Acid',
    class: 'Humectant', fn: 'Hydration',
    formula: '(C₁₄H₂₁NO₁₁)ₙ', mw: 1000, conc: '1.0%', pH: '6.0',
    tol: { dry: '●', oily: '●', comb: '●', sens: '●', reac: '●' },
    origin: 'Bio-fermented · KR',
    used: ['The Veil'],
    blurb: 'b', evidence: 'e',
  },
]

const essays: Record<string, Essay> = {
  NIA: { story: ['Niacinamide para one.', 'Para two.', 'Para three.'], aside: 'NIA aside.' },
  RET: { story: ['Retinaldehyde para one.', 'Para two.'], aside: 'RET aside.' },
  HYA: { story: ['Hyaluronic para one.'], aside: 'HYA aside.' },
}

const defaultEssay: Essay = { story: ['Default para.'], aside: 'Default aside.' }

beforeEach(() => {
  // Reset URL hash + storage between tests so chapter resolution stays deterministic
  window.history.replaceState(null, '', '/ingredients')
  window.localStorage.clear()
})

describe('IngredientsReader', () => {
  it('renders the chapter rail with one chip per ingredient', () => {
    render(
      <IngredientsReader
        ingredients={fixtureIngredients}
        essays={essays}
        defaultEssay={defaultEssay}
      />,
    )
    expect(screen.getByTestId('chapter-rail')).toBeDefined()
    expect(screen.getByTestId('chapter-chip-NIA')).toBeDefined()
    expect(screen.getByTestId('chapter-chip-RET')).toBeDefined()
    expect(screen.getByTestId('chapter-chip-HYA')).toBeDefined()
  })

  it('marks the first chapter active by default', () => {
    render(
      <IngredientsReader
        ingredients={fixtureIngredients}
        essays={essays}
        defaultEssay={defaultEssay}
      />,
    )
    expect(screen.getByTestId('chapter-chip-NIA')).toHaveAttribute('data-active', 'true')
    expect(screen.getByTestId('chapter-chip-RET')).toHaveAttribute('data-active', 'false')
  })

  it('renders the first chapter essay body by default', () => {
    render(
      <IngredientsReader
        ingredients={fixtureIngredients}
        essays={essays}
        defaultEssay={defaultEssay}
      />,
    )
    expect(screen.getByTestId('essay-entry')).toHaveAttribute('data-sym', 'NIA')
    expect(screen.getByTestId('essay-title')).toHaveTextContent(/Niacinamide/)
    expect(screen.getByTestId('essay-aside')).toHaveTextContent(/NIA aside/)
  })

  it('switches the essay when another chip is clicked', async () => {
    const user = userEvent.setup()
    render(
      <IngredientsReader
        ingredients={fixtureIngredients}
        essays={essays}
        defaultEssay={defaultEssay}
      />,
    )

    await user.click(screen.getByTestId('chapter-chip-HYA'))

    expect(screen.getByTestId('essay-entry')).toHaveAttribute('data-sym', 'HYA')
    expect(screen.getByTestId('essay-title')).toHaveTextContent(/Hyaluronic Acid/)
    expect(screen.getByTestId('chapter-chip-HYA')).toHaveAttribute('data-active', 'true')
  })

  it('clicking a chip updates the URL hash to #essay/[SYM]', async () => {
    const user = userEvent.setup()
    render(
      <IngredientsReader
        ingredients={fixtureIngredients}
        essays={essays}
        defaultEssay={defaultEssay}
      />,
    )

    await user.click(screen.getByTestId('chapter-chip-RET'))

    expect(window.location.hash).toBe('#essay/RET')
  })

  it('writes the selected symbol to localStorage under mt_essay_sym', async () => {
    const user = userEvent.setup()
    render(
      <IngredientsReader
        ingredients={fixtureIngredients}
        essays={essays}
        defaultEssay={defaultEssay}
      />,
    )

    await user.click(screen.getByTestId('chapter-chip-RET'))

    expect(window.localStorage.getItem('mt_essay_sym')).toBe('RET')
  })

  it('renders prev + next chapter link buttons', () => {
    render(
      <IngredientsReader
        ingredients={fixtureIngredients}
        essays={essays}
        defaultEssay={defaultEssay}
      />,
    )
    expect(screen.getByTestId('chapter-link-prev')).toBeDefined()
    expect(screen.getByTestId('chapter-link-next')).toBeDefined()
  })

  it('next chapter link wraps around to the first ingredient on the last one', async () => {
    const user = userEvent.setup()
    render(
      <IngredientsReader
        ingredients={fixtureIngredients}
        essays={essays}
        defaultEssay={defaultEssay}
      />,
    )

    // Walk NIA -> RET -> HYA
    await user.click(screen.getByTestId('chapter-chip-HYA'))
    expect(screen.getByTestId('essay-entry')).toHaveAttribute('data-sym', 'HYA')

    // Next should wrap to NIA
    await user.click(screen.getByTestId('chapter-link-next'))
    expect(screen.getByTestId('essay-entry')).toHaveAttribute('data-sym', 'NIA')
  })

  it('prev chapter link wraps around to the last ingredient on the first one', async () => {
    const user = userEvent.setup()
    render(
      <IngredientsReader
        ingredients={fixtureIngredients}
        essays={essays}
        defaultEssay={defaultEssay}
      />,
    )

    await user.click(screen.getByTestId('chapter-link-prev'))
    expect(screen.getByTestId('essay-entry')).toHaveAttribute('data-sym', 'HYA')
  })

  it('falls back to defaultEssay when a symbol has no entry in the essays map', () => {
    const partialEssays = { NIA: essays.NIA }
    render(
      <IngredientsReader
        ingredients={fixtureIngredients}
        essays={partialEssays}
        defaultEssay={defaultEssay}
      />,
    )
    render(
      <IngredientsReader
        ingredients={[fixtureIngredients[1]]}
        essays={partialEssays}
        defaultEssay={defaultEssay}
      />,
    )
    // Second render has only RET, with no essay in map -> should use default
    const entries = screen.getAllByTestId('essay-entry')
    const retEntry = entries.find((e) => e.getAttribute('data-sym') === 'RET')
    expect(retEntry).toBeDefined()
    const aside = retEntry!.querySelector('[data-testid="essay-aside"]')
    expect(aside?.textContent).toMatch(/Default aside/)
  })

  it('renders the "Appears in" list for the active ingredient', () => {
    render(
      <IngredientsReader
        ingredients={fixtureIngredients}
        essays={essays}
        defaultEssay={defaultEssay}
      />,
    )
    expect(screen.getByTestId('essay-appears-in')).toHaveTextContent('The Corrective')
  })

  it('renders the data-sheet sidecar with the symbol and class', () => {
    render(
      <IngredientsReader
        ingredients={fixtureIngredients}
        essays={essays}
        defaultEssay={defaultEssay}
      />,
    )
    const sidecar = screen.getByTestId('ingredient-sidecar')
    expect(sidecar).toHaveTextContent('NIA')
    expect(sidecar).toHaveTextContent('Niacinamide')
    expect(sidecar).toHaveTextContent('Active')
  })
})
