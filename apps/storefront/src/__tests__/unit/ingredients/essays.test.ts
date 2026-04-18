import { describe, it, expect } from 'vitest'
import { loadEssay } from '@/lib/ingredients/essays'

describe('Essay loader', () => {
  it('loads the NIA essay with 3 paragraphs and an aside', () => {
    const essay = loadEssay('NIA')
    expect(essay.story).toHaveLength(3)
    expect(essay.story[0]).toMatch(/Niacinamide began as a footnote/)
    expect(essay.aside).toMatch(/efficacy plateaus between 2–5%/)
  })

  it('loads the RET essay', () => {
    const essay = loadEssay('RET')
    expect(essay.story[0]).toMatch(/Retinaldehyde is the middle chapter/)
    expect(essay.aside).toMatch(/Retinaldehyde is not interchangeable/)
  })

  it('loads the HYA essay', () => {
    const essay = loadEssay('HYA')
    expect(essay.story[0]).toMatch(/Hyaluronic acid is not a product of modern chemistry/)
    expect(essay.aside).toMatch(/In dry climates/)
  })

  it('falls back to the default essay for a symbol without a file', () => {
    const essay = loadEssay('ZZZ')
    expect(essay.story.length).toBeGreaterThan(0)
    expect(essay.aside.length).toBeGreaterThan(0)
    // Shouldn't match the NIA-specific content
    expect(essay.story[0]).not.toMatch(/Niacinamide began/)
  })

  it('is case-insensitive on the symbol', () => {
    const upper = loadEssay('NIA')
    const mixed = loadEssay('nia')
    expect(mixed.aside).toBe(upper.aside)
  })
})
