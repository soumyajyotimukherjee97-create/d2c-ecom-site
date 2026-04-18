import { describe, it, expect } from 'vitest'
import { INGREDIENTS, storyTitle } from '@/lib/ingredients/catalogue'

describe('Ingredients catalogue', () => {
  it('contains exactly 17 entries (matter formulary)', () => {
    expect(INGREDIENTS).toHaveLength(17)
  })

  it('every symbol is unique', () => {
    const syms = INGREDIENTS.map((i) => i.sym)
    expect(new Set(syms).size).toBe(syms.length)
  })

  it('every chapter number is unique and zero-padded', () => {
    const ns = INGREDIENTS.map((i) => i.n)
    expect(new Set(ns).size).toBe(ns.length)
    ns.forEach((n) => expect(n).toMatch(/^\d{2}$/))
  })

  it('chapter numbers run 01 through 17 in sequence', () => {
    INGREDIENTS.forEach((ing, idx) => {
      expect(ing.n).toBe(String(idx + 1).padStart(2, '0'))
    })
  })

  it('every tolerance mark is one of ●, ◐, ○', () => {
    for (const ing of INGREDIENTS) {
      for (const mark of Object.values(ing.tol)) {
        expect(['●', '◐', '○']).toContain(mark)
      }
    }
  })

  it('storyTitle returns the right word for each class', () => {
    const get = (cls: string) => {
      const ing = INGREDIENTS.find((i) => i.class === cls)
      return ing ? storyTitle(ing) : null
    }
    expect(get('Active')).toBe('science')
    expect(get('Exfoliant')).toBe('craft')
    expect(get('Humectant')).toBe('history')
    expect(get('Emollient')).toBe('shape')
    expect(get('Peptide')).toBe('signal')
    expect(get('Antioxidant')).toBe('defence')
    expect(get('Botanical')).toBe('origin')
  })
})
