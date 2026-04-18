'use client'

import { useState } from 'react'

type Ingredient = {
  key:      string
  name:     string
  formula:  string
  headline: React.ReactNode
  copy:     string
  data:     [string, string][]
}

const INGREDIENTS: Ingredient[] = [
  {
    key:      'niacinamide',
    name:     'Niacinamide',
    formula:  'C₆H₆N₂O · 122.12 g/mol',
    headline: <>why <em className="italic">2%</em> is the sweet spot.</>,
    copy:     "At 2%, niacinamide visibly reduces pore size and regulates sebum without irritating sensitive skin. Higher isn't better — it's about precision.",
    data:     [
      ['Concentration',    '2.0%'],
      ['Trial reference',  'MT-CT-0026'],
      ['Efficacy plateau', '2 – 3%'],
    ],
  },
  {
    key:      'retinal',
    name:     'Retinaldehyde',
    formula:  'C₂₀H₂₈O · 284.44 g/mol',
    headline: <>why <em className="italic">0.05%</em> rivals retinol 1%.</>,
    copy:     'Retinaldehyde converts to retinoic acid in a single step — 11× faster than retinol. A small dose delivers prescription-adjacent results with a fraction of the irritation.',
    data:     [
      ['Concentration',   '0.05%'],
      ['Trial reference', 'MT-CT-0019'],
      ['Conversion rate', '11×'],
    ],
  },
  {
    key:      'aha',
    name:     'Mandelic acid',
    formula:  'C₈H₈O₃ · 152.15 g/mol',
    headline: <>why the <em className="italic">largest</em> AHA wins.</>,
    copy:     "Mandelic's oversized molecule penetrates slowly and evenly, exfoliating without the sting. Gentler than glycolic, more effective than lactic for pigmented and reactive skin.",
    data:     [
      ['Concentration', '8.0%'],
      ['Molecular size', '152 Da'],
      ['pH',            '3.6'],
    ],
  },
  {
    key:      'bakuchiol',
    name:     'Bakuchiol',
    formula:  'C₁₈H₂₄O · 256.38 g/mol',
    headline: <>why <em className="italic">plants</em> match retinoids.</>,
    copy:     'Isolated from Psoralea corylifolia, bakuchiol up-regulates the same gene pathway as retinol — with no photosensitivity and no barrier disruption. Safe through pregnancy.',
    data:     [
      ['Concentration',  '1.0%'],
      ['Photostability', 'UV-stable'],
      ['Pregnancy',      'Safe'],
    ],
  },
]

export function HomeSpotlight() {
  const [activeKey, setActiveKey] = useState(INGREDIENTS[0].key)
  const active = INGREDIENTS.find((i) => i.key === activeKey) ?? INGREDIENTS[0]
  const activeIdx = INGREDIENTS.findIndex((i) => i.key === activeKey)

  return (
    <section
      data-testid="home-spotlight"
      className="bg-paper-2 border-b border-hairline"
    >
      <div className="max-w-container mx-auto px-8 py-24">
        <div className="flex items-end justify-between gap-8 mb-10">
          <div>
            <p className="font-mono text-2xs tracking-widest uppercase text-graphite">
              § III — Know your ingredient
            </p>
            <h2 className="font-display text-4xl md:text-5xl text-ink mt-3.5">
              The <em className="italic">science</em>.
            </h2>
          </div>
          <p
            data-testid="spotlight-counter"
            className="font-mono text-2xs tracking-widest uppercase text-graphite whitespace-nowrap"
          >
            {activeIdx + 1} / {INGREDIENTS.length}
          </p>
        </div>

        {/* Tab selector — full-width 4-col grid, ink/paper flip on selection */}
        <div
          role="tablist"
          aria-label="Ingredient selector"
          data-testid="spotlight-tablist"
          className="grid grid-cols-2 md:grid-cols-4 border border-hairline bg-paper mb-14"
        >
          {INGREDIENTS.map((ing, idx) => {
            const selected = ing.key === activeKey
            const notLast  = idx < INGREDIENTS.length - 1
            return (
              <button
                key={ing.key}
                type="button"
                role="tab"
                aria-selected={selected}
                data-testid={`spotlight-tab-${ing.key}`}
                onClick={() => setActiveKey(ing.key)}
                className={[
                  'text-left px-4 py-4 md:py-[18px] transition-colors',
                  notLast ? 'md:border-r border-hairline' : '',
                  selected ? 'bg-ink text-paper' : 'text-ink hover:bg-paper-3',
                  'focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-ink focus-visible:outline-offset-[-2px]',
                ].join(' ')}
              >
                <p
                  className={`font-mono text-[9px] tracking-widest uppercase ${selected ? 'text-paper/55' : 'text-graphite'}`}
                >
                  {String(idx + 1).padStart(2, '0')}
                </p>
                <p className="font-display text-xl md:text-2xl mt-1.5 leading-tight">
                  {ing.name}
                </p>
              </button>
            )
          })}
        </div>

        {/* Content grid */}
        <div
          data-testid="spotlight-content"
          className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center"
        >
          <div className="md:col-span-6">
            <p className="font-mono text-2xs tracking-widest uppercase text-graphite">
              {active.name.toUpperCase()} — {active.formula}
            </p>
            <h3 className="font-display text-[clamp(40px,4.6vw,64px)] leading-none tracking-tighter mt-4">
              {active.headline}
            </h3>
            <p className="font-body text-sm leading-[1.7] text-ink-2 max-w-[480px] mt-7">
              {active.copy}
            </p>
            <p className="font-mono text-2xs tracking-widest uppercase text-graphite mt-6">
              — Dr. Inès Saad, head of formulation
            </p>
          </div>

          <div className="md:col-span-6 md:col-start-7">
            <div
              aria-hidden="true"
              className="m-ph m-ph--mineral aspect-[4/5] relative flex items-end justify-between p-4 font-mono text-[9px] tracking-widest uppercase text-graphite"
            >
              <span>Specimen · {active.name}</span>
              <span>{active.formula.split('·')[0].trim()}</span>
            </div>

            <div className="grid grid-cols-3 mt-3.5 border border-hairline bg-paper">
              {active.data.map(([k, v], i) => (
                <div
                  key={k}
                  className={`p-3.5 ${i < 2 ? 'border-r border-hairline/60' : ''}`}
                >
                  <p className="font-mono text-[9px] tracking-widest uppercase text-graphite mb-1.5">
                    {k}
                  </p>
                  <p className="font-mono text-sm text-ink tabular-nums">
                    {v}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
