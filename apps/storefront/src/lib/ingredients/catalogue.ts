/**
 * The Matter Formulary Index — 17 ingredients.
 * This is reference data (formulas, masses, tolerance matrices) that powers
 * the /ingredients page. Editorial essay content lives alongside in
 * `src/content/ingredients/{SYM}.md`.
 *
 * Edit this file when an ingredient is added / dosage changes / supplier
 * changes. Edits should go through PR review — every field here is a claim
 * published on a customer-facing page.
 */

export type IngredientClass =
  | 'Active'
  | 'Exfoliant'
  | 'Humectant'
  | 'Emollient'
  | 'Peptide'
  | 'Antioxidant'
  | 'Botanical'

export type ToleranceMark = '●' | '◐' | '○'

export interface IngredientTolerance {
  dry:  ToleranceMark
  oily: ToleranceMark
  comb: ToleranceMark
  sens: ToleranceMark
  reac: ToleranceMark
}

export interface IngredientEntry {
  /** 3-letter symbol, used as the hash fragment (#essay/NIA) and deep-link key. */
  sym:      string
  /** Zero-padded chapter number "01" through "17". */
  n:        string
  name:     string
  class:    IngredientClass
  fn:       string
  formula:  string
  /** Molar mass in g/mol. */
  mw:       number
  /** Typical formulation concentration string (e.g. "2.0%"). */
  conc:     string
  /** Working pH, or "—" when not applicable. */
  pH:       string
  tol:      IngredientTolerance
  origin:   string
  /** Product display names this appears in. Resolved to /products/[slug] at render time. */
  used:     string[]
  blurb:    string
  evidence: string
}

export const INGREDIENTS: IngredientEntry[] = [
  {
    sym: 'NIA', n: '01', name: 'Niacinamide',
    class: 'Active', fn: 'Barrier · Sebum',
    formula: 'C₆H₆N₂O', mw: 122.12, conc: '4.0%', pH: '5.5',
    tol: { dry: '●', oily: '●', comb: '●', sens: '●', reac: '●' },
    origin: 'Synthesised · pharmaceutical grade · EU',
    used: ['The Corrective', 'The Morning'],
    blurb: 'Reduces pore visibility, regulates sebum, and strengthens barrier lipid synthesis. Tolerated by virtually every skin type.',
    evidence: 'MT-CT-0026 · n=104 · 56 days',
  },
  {
    sym: 'RET', n: '02', name: 'Retinaldehyde',
    class: 'Active', fn: 'Renewal',
    formula: 'C₂₀H₂₈O', mw: 284.44, conc: '0.05%', pH: '5.5',
    tol: { dry: '◐', oily: '●', comb: '●', sens: '◐', reac: '○' },
    origin: 'Encapsulated synthesis · Switzerland',
    used: ['Night Repair'],
    blurb: 'Converts to retinoic acid in one step — 11× faster than retinol. Prescription-adjacent results, a fraction of the irritation.',
    evidence: 'MT-CT-0019 · n=82 · 12 weeks',
  },
  {
    sym: 'MAN', n: '03', name: 'Mandelic Acid',
    class: 'Exfoliant', fn: 'Resurfacing',
    formula: 'C₈H₈O₃', mw: 152.15, conc: '8.0%', pH: '3.6',
    tol: { dry: '●', oily: '●', comb: '●', sens: '◐', reac: '◐' },
    origin: 'Bitter almond derivative · France',
    used: ['The Clarifier'],
    blurb: 'The largest AHA. Penetrates slowly and evenly, exfoliating without the sting. Ideal for pigmented and reactive skin.',
    evidence: 'MT-CT-0011 · n=60 · 28 days',
  },
  {
    sym: 'BAK', n: '04', name: 'Bakuchiol',
    class: 'Active', fn: 'Renewal',
    formula: 'C₁₈H₂₄O', mw: 256.38, conc: '1.0%', pH: '5.5',
    tol: { dry: '●', oily: '●', comb: '●', sens: '●', reac: '●' },
    origin: 'Psoralea corylifolia · India',
    used: ['The Dusk'],
    blurb: 'Plant retinol alternative. Up-regulates the same gene pathway without photosensitivity. Safe through pregnancy.',
    evidence: 'MT-CT-0022 · n=48 · 12 weeks',
  },
  {
    sym: 'SAL', n: '05', name: 'Salicylic Acid',
    class: 'Exfoliant', fn: 'Pore clearance',
    formula: 'C₇H₆O₃', mw: 138.12, conc: '2.0%', pH: '3.4',
    tol: { dry: '◐', oily: '●', comb: '●', sens: '○', reac: '○' },
    origin: 'Willow bark derivative · Germany',
    used: ['The Clarifier'],
    blurb: 'Oil-soluble BHA. Penetrates sebum-filled pores to dissolve keratinocyte plugs. Best for oily, breakout-prone skin.',
    evidence: 'Published monograph · FDA 2021',
  },
  {
    sym: 'AZE', n: '06', name: 'Azelaic Acid',
    class: 'Active', fn: 'Redness · Pigment',
    formula: 'C₉H₁₆O₄', mw: 188.22, conc: '10%', pH: '4.5',
    tol: { dry: '●', oily: '●', comb: '●', sens: '●', reac: '●' },
    origin: 'Fermented grain · Sweden',
    used: ['The Calm'],
    blurb: 'Multitasking dicarboxylic acid. Reduces post-inflammatory pigment, calms redness, and inhibits C. acnes. Rosacea-friendly.',
    evidence: 'MT-CT-0031 · n=74 · 8 weeks',
  },
  {
    sym: 'HYA', n: '07', name: 'Hyaluronic Acid',
    class: 'Humectant', fn: 'Hydration',
    formula: '(C₁₄H₂₁NO₁₁)ₙ', mw: 1000, conc: '1.0%', pH: '6.0',
    tol: { dry: '●', oily: '●', comb: '●', sens: '●', reac: '●' },
    origin: 'Bio-fermented · South Korea',
    used: ['The Reservoir', 'The Veil'],
    blurb: 'Low + high molecular weight blend. Surface hydration and deep dermal plumping. Universal tolerance.',
    evidence: 'Clinical consensus · 40+ years',
  },
  {
    sym: 'GLY', n: '08', name: 'Glycerin',
    class: 'Humectant', fn: 'Hydration',
    formula: 'C₃H₈O₃', mw: 92.09, conc: '5.0%', pH: '—',
    tol: { dry: '●', oily: '●', comb: '●', sens: '●', reac: '●' },
    origin: 'Vegetable · palm-free · Germany',
    used: ['The Reservoir', 'The Morning', 'The Veil'],
    blurb: 'The gold-standard humectant. Draws water from the environment and binds it to the stratum corneum.',
    evidence: 'Published monograph',
  },
  {
    sym: 'PAN', n: '09', name: 'Panthenol',
    class: 'Humectant', fn: 'Soothing',
    formula: 'C₉H₁₉NO₄', mw: 205.25, conc: '2.0%', pH: '5.5',
    tol: { dry: '●', oily: '●', comb: '●', sens: '●', reac: '●' },
    origin: 'Pro-vitamin B5 · synthesised · FR',
    used: ['The Corrective', 'The Calm'],
    blurb: 'Converts to pantothenic acid in the skin. Barrier-calming and mildly hydrating. Soothes post-actives.',
    evidence: 'Published monograph',
  },
  {
    sym: 'CER', n: '10', name: 'Ceramide NP',
    class: 'Emollient', fn: 'Barrier',
    formula: 'C₄₂H₈₃NO₄', mw: 666.12, conc: '1.0%', pH: '—',
    tol: { dry: '●', oily: '●', comb: '●', sens: '●', reac: '●' },
    origin: 'Bio-identical · Japan',
    used: ['Night Repair', 'The Veil'],
    blurb: 'Replaces the lipids lost through cleansing and ageing. Restores watertight seal of the stratum corneum.',
    evidence: 'MT-CT-0018 · TEWL measured',
  },
  {
    sym: 'SQU', n: '11', name: 'Squalane',
    class: 'Emollient', fn: 'Barrier',
    formula: 'C₃₀H₆₂', mw: 422.81, conc: 'q.s.', pH: '—',
    tol: { dry: '●', oily: '●', comb: '●', sens: '●', reac: '●' },
    origin: 'Olive-derived · Spain',
    used: ['The Veil', 'The Dusk'],
    blurb: "Saturated lipid mimicking skin's natural sebum composition. Non-comedogenic, even on oily skin.",
    evidence: 'Published monograph',
  },
  {
    sym: 'PMT', n: '12', name: 'Palmitoyl Tripeptide-1',
    class: 'Peptide', fn: 'Collagen signalling',
    formula: 'C₃₀H₅₇N₅O₅', mw: 567.82, conc: '0.5%', pH: '5.5',
    tol: { dry: '●', oily: '●', comb: '●', sens: '●', reac: '●' },
    origin: 'Synthesised · Switzerland',
    used: ['Night Repair'],
    blurb: 'Signal peptide that prompts fibroblasts to upregulate collagen I and III. Measurable firmness gains at 12 weeks.',
    evidence: 'MT-CT-0024 · n=38',
  },
  {
    sym: 'VTC', n: '13', name: 'L-Ascorbic Acid',
    class: 'Antioxidant', fn: 'Pigment · Radiance',
    formula: 'C₆H₈O₆', mw: 176.12, conc: '15%', pH: '3.2',
    tol: { dry: '●', oily: '●', comb: '●', sens: '◐', reac: '○' },
    origin: 'Corn-derived · Scotland',
    used: ['The Morning'],
    blurb: 'The only form of vitamin C with full published evidence. Stabilised at pH 3.2 for bio-availability.',
    evidence: 'Pinnell 2001 · MT-CT-0009',
  },
  {
    sym: 'VTE', n: '14', name: 'Tocopherol',
    class: 'Antioxidant', fn: 'Lipid defense',
    formula: 'C₂₉H₅₀O₂', mw: 430.71, conc: '1.0%', pH: '—',
    tol: { dry: '●', oily: '●', comb: '●', sens: '●', reac: '●' },
    origin: 'Non-GMO soy · Italy',
    used: ['The Morning', 'The Dusk'],
    blurb: 'Lipid-soluble vitamin E. Synergises with L-ascorbic acid for 4× photoprotective potency.',
    evidence: 'Published monograph',
  },
  {
    sym: 'FER', n: '15', name: 'Ferulic Acid',
    class: 'Antioxidant', fn: 'Stabiliser',
    formula: 'C₁₀H₁₀O₄', mw: 194.18, conc: '0.5%', pH: '4.0',
    tol: { dry: '●', oily: '●', comb: '●', sens: '●', reac: '●' },
    origin: 'Rice bran · Japan',
    used: ['The Morning'],
    blurb: 'Stabilises L-ascorbic acid and doubles its photoprotection. Essential companion to vitamin C.',
    evidence: 'Lin 2005',
  },
  {
    sym: 'CEN', n: '16', name: 'Madecassoside',
    class: 'Botanical', fn: 'Anti-inflammatory',
    formula: 'C₄₈H₇₈O₂₀', mw: 975.12, conc: '0.1%', pH: '—',
    tol: { dry: '●', oily: '●', comb: '●', sens: '●', reac: '●' },
    origin: 'Centella asiatica · Madagascar',
    used: ['The Corrective', 'The Calm'],
    blurb: 'Isolated triterpene from centella. Reduces post-procedural inflammation and accelerates barrier repair.',
    evidence: 'MT-CT-0027 · n=44',
  },
  {
    sym: 'GLU', n: '17', name: 'β-Glucan',
    class: 'Botanical', fn: 'Soothing',
    formula: '(C₆H₁₀O₅)ₙ', mw: 6000, conc: '0.5%', pH: '—',
    tol: { dry: '●', oily: '●', comb: '●', sens: '●', reac: '●' },
    origin: 'Oat-derived · Finland',
    used: ['The Calm'],
    blurb: 'High molecular weight polysaccharide. Forms a moisture-binding film that calms reactive skin.',
    evidence: 'Published monograph',
  },
]

/** Headline word varies by class. Produces "The [word] of [Name]." */
export function storyTitle(ing: IngredientEntry): string {
  const map: Record<IngredientClass, string> = {
    Active:      'science',
    Exfoliant:   'craft',
    Humectant:   'history',
    Emollient:   'shape',
    Peptide:     'signal',
    Antioxidant: 'defence',
    Botanical:   'origin',
  }
  return map[ing.class] ?? 'story'
}
