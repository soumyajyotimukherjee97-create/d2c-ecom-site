import type { Metadata } from 'next'
import { INGREDIENTS } from '@/lib/ingredients/catalogue'
import { loadEssay, type Essay } from '@/lib/ingredients/essays'
import { IngredientsReader } from '@/components/shop/IngredientsReader'

export const metadata: Metadata = {
  title:       'Ingredients · matter',
  description:
    'The Formulary Index — every active, humectant, emollient, and botanical that appears across the matter range, written as short essays with mechanism, history, and provenance.',
}

function IngredientsHero() {
  return (
    <section
      aria-label="The Formulary Index"
      data-testid="ingredients-hero"
      className="bg-paper-2 border-b border-hairline"
    >
      <div className="max-w-container mx-auto px-8 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-20 items-end">
          <div>
            <p className="font-mono text-[10px] tracking-[0.18em] uppercase text-graphite">
              § The Formulary Index
            </p>
            <h1 className="font-display font-normal text-[clamp(56px,7vw,112px)] leading-[0.95] tracking-tightest mt-5">
              Every <em className="italic">molecule</em>,<br />
              indexed.
            </h1>
          </div>

          <div>
            <p className="font-body text-base leading-[1.6] text-ink-2 max-w-[480px]">
              The full catalogue of actives, humectants, emollients and
              botanicals that appear across the matter formulary — written as
              short essays, with history, mechanism and provenance for each.
            </p>
            <div className="grid grid-cols-3 mt-10 border-t border-hairline">
              {[
                ['Chapters',  String(INGREDIENTS.length)],
                ['Read time', `${INGREDIENTS.length * 4} min`],
                ['Updated',   'Apr 2026'],
              ].map(([k, v], i) => (
                <div
                  key={k}
                  className={`px-3 py-3.5 ${i < 2 ? 'border-r border-hairline/60' : ''}`}
                >
                  <p className="font-mono text-[9px] tracking-widest uppercase text-graphite">
                    {k}
                  </p>
                  <p className="font-mono text-lg tabular-nums mt-1 text-ink">{v}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function Philosophy() {
  const items = [
    ['01 Disclosure', 'Every ingredient published with exact concentration. No proprietary blends, no "active complex" hand-waving.'],
    ['02 Restraint',  'If a molecule lacks trial evidence or measurable benefit, we do not use it. Short ingredient lists, by design.'],
    ['03 Provenance', 'Origin, supplier class and extraction method documented for each lot. Available on request for professionals.'],
  ] as const

  return (
    <section
      aria-label="Philosophy"
      data-testid="ingredients-philosophy"
      className="bg-paper border-b border-hairline"
    >
      <div className="max-w-container mx-auto px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {items.map(([heading, body]) => (
            <div key={heading} className="border-t border-hairline pt-5">
              <p className="font-mono text-[10px] tracking-[0.18em] uppercase text-graphite">
                {heading}
              </p>
              <p className="font-body text-sm leading-[1.6] text-ink-2 mt-3">
                {body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default function IngredientsPage() {
  // Eagerly load every essay at build time; fall back to default when missing.
  const defaultEssay = loadEssay('_default')
  const essays: Record<string, Essay> = {}
  for (const ing of INGREDIENTS) {
    essays[ing.sym] = loadEssay(ing.sym)
  }

  return (
    <>
      <IngredientsHero />
      <IngredientsReader
        ingredients={INGREDIENTS}
        essays={essays}
        defaultEssay={defaultEssay}
      />
      <Philosophy />
    </>
  )
}
