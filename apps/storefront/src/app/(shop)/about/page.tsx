import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About · matter',
  description:
    'The matter manifesto — nine clauses, unchanged since founding. What we stand for, what we measure, what we refuse to ship.',
}

const CLAUSES = [
  'A formula is a claim. A claim without percentages is a story.',
  'If a molecule has no trial evidence, it has no place in a product.',
  'We name every active, at its exact concentration, on every bottle.',
  'Short ingredient lists are not a marketing position. They are a discipline.',
  'Fragrance is a liability for reactive skin. We do not use it.',
  'A lot that fails its assay does not ship. It is destroyed.',
  'We publish what we measured, including the things that didn\u2019t work.',
  'Before and after photographs can be staged. Clinical scores cannot.',
  'Restraint is not austerity. It is confidence in what remains.',
] as const

function ConcentricArcs() {
  return (
    <svg
      viewBox="0 0 400 400"
      preserveAspectRatio="xMinYMid meet"
      aria-hidden="true"
      className="absolute left-[-60px] top-1/2 -translate-y-1/2 w-[34vw] max-w-[520px] h-auto opacity-60 pointer-events-none text-hairline hidden md:block"
    >
      <g fill="none" stroke="currentColor" strokeWidth="1">
        {Array.from({ length: 10 }).map((_, i) => (
          <circle key={i} cx="200" cy="200" r={20 + i * 18} />
        ))}
        <line x1="0" y1="200" x2="400" y2="200" />
        <line x1="200" y1="0" x2="200" y2="400" />
      </g>
      <circle cx="200" cy="200" r="3" className="fill-ink" />
    </svg>
  )
}

function RuledGrid() {
  return (
    <svg
      viewBox="0 0 300 400"
      preserveAspectRatio="xMaxYMid meet"
      aria-hidden="true"
      className="absolute right-[-40px] top-1/2 -translate-y-1/2 w-[24vw] max-w-[360px] h-auto opacity-55 pointer-events-none text-hairline hidden md:block"
    >
      <g fill="none" stroke="currentColor" strokeWidth="1">
        {Array.from({ length: 22 }).map((_, i) => (
          <line key={`v${i}`} x1={i * 14} y1="40" x2={i * 14} y2="360" />
        ))}
        {Array.from({ length: 12 }).map((_, i) => (
          <line key={`h${i}`} x1="0" y1={40 + i * 29} x2="300" y2={40 + i * 29} />
        ))}
      </g>
      <g className="fill-ink">
        <rect x="0" y="38" width="6" height="1" />
        <rect x="294" y="38" width="6" height="1" />
        <rect x="0" y="358" width="6" height="1" />
        <rect x="294" y="358" width="6" height="1" />
      </g>
    </svg>
  )
}

function AboutHero() {
  return (
    <section
      data-testid="about-hero"
      className="relative overflow-hidden border-b border-hairline bg-paper"
    >
      <ConcentricArcs />
      <RuledGrid />

      <div className="relative z-10 max-w-container mx-auto px-8 pt-[88px] pb-[72px] text-center">
        <p
          data-testid="about-hero-kicker"
          className="font-mono text-2xs tracking-[0.3em] uppercase text-graphite"
        >
          § The matter manifesto
        </p>

        <h1
          data-testid="about-hero-title"
          className="font-display font-normal text-[clamp(72px,9vw,160px)] leading-[0.92] tracking-tightest mt-[22px]"
        >
          What <em className="italic">we</em>
          <br />
          stand for.
        </h1>

        <div className="flex items-center justify-center gap-[18px] max-w-[640px] mx-auto mt-10">
          <span className="flex-1 h-px bg-hairline" aria-hidden="true" />
          <span className="font-mono text-2xs tracking-[0.2em] uppercase text-graphite">
            Nine clauses · one page
          </span>
          <span className="flex-1 h-px bg-hairline" aria-hidden="true" />
        </div>

        <p
          data-testid="about-hero-standfirst"
          className="font-body text-[17px] leading-[1.6] text-ink-2 max-w-[560px] mx-auto mt-7"
        >
          This is the document the two of us wrote on the first day of the
          company, and that every formula, every lot, and every word we publish
          still answers to.
        </p>

        <div className="mt-14 flex flex-col items-center gap-[10px]">
          <span className="font-mono text-[9px] tracking-[0.3em] uppercase text-graphite">
            Read below
          </span>
          <span
            className="block w-px h-11 bg-graphite"
            aria-hidden="true"
          />
        </div>
      </div>
    </section>
  )
}

function Manifesto() {
  return (
    <section
      data-testid="about-manifesto"
      className="bg-paper border-b border-hairline"
    >
      {/* Masthead */}
      <div
        data-testid="about-manifesto-masthead"
        className="grid grid-cols-[1fr_auto_1fr] items-center gap-6 px-8 md:px-12 pt-7 pb-[18px] border-b-[3px] border-double border-ink font-mono text-2xs tracking-ultra uppercase"
      >
        <span className="text-graphite">Vol. I · No. 01</span>
        <span className="text-ink text-xs tracking-[0.3em] whitespace-nowrap">
          The Matter Broadsheet
        </span>
        <span className="text-graphite text-right">14 March 2024</span>
      </div>

      {/* Headline + deck */}
      <div className="border-b border-ink px-8 md:px-12 pt-12 pb-10 text-center">
        <p className="font-mono text-2xs tracking-[0.32em] uppercase text-graphite">
          A leader, from the founders
        </p>
        <h2
          data-testid="about-manifesto-headline"
          className="font-display font-normal text-[clamp(56px,7vw,112px)] leading-[0.95] tracking-tighter mt-[18px] mx-auto max-w-[14ch] [text-wrap:balance]"
        >
          Nine <em className="italic">clauses</em>, unchanged
          <br />
          since founding.
        </h2>
        <p className="max-w-[560px] mx-auto mt-6 font-body text-[15px] leading-[1.55] text-ink-2">
          Every product we ship, every lot we release, and every sentence we
          print is measured against the document below.
        </p>
      </div>

      {/* Two-column body */}
      <div className="px-8 md:px-12 pt-14 pb-12">
        <div className="max-w-[1100px] mx-auto font-display text-xl leading-[1.5] text-ink text-justify [hyphens:auto] [column-count:1] md:[column-count:2] [column-gap:56px] md:[column-rule:1px_solid_theme(colors.hairline)]">
          {CLAUSES.map((text, i) => {
            const num = String(i + 1).padStart(2, '0')
            const isFirst = i === 0
            return (
              <p
                key={i}
                data-testid={`about-clause-${i + 1}`}
                className={`[break-inside:avoid] ${isFirst ? 'm-0' : 'mt-[22px]'}`}
              >
                {isFirst && (
                  <span className="float-left font-display italic text-[72px] leading-[0.8] pt-[6px] pr-[10px]">
                    {text[0]}
                  </span>
                )}
                <span className="font-mono text-2xs tracking-ultra uppercase text-graphite mr-[10px] align-baseline">
                  §{num}
                </span>
                <span>{isFirst ? text.slice(1) : text}</span>
              </p>
            )
          })}
        </div>

        {/* Sign-off */}
        <div
          data-testid="about-signoff"
          className="max-w-[1100px] mx-auto mt-14 border-t-[3px] border-double border-ink pt-7 grid grid-cols-1 md:grid-cols-2 gap-8 items-end"
        >
          <div data-testid="about-signoff-founders">
            <p className="font-mono text-2xs tracking-ultra uppercase text-graphite">
              Signed, the founders
            </p>
            <p className="font-display italic text-[clamp(36px,4vw,56px)] mt-[10px] tracking-tighter leading-none">
              A. Rao · K. Mendelsohn
            </p>
          </div>
          <div data-testid="about-signoff-filed" className="md:text-right">
            <p className="font-mono text-2xs tracking-ultra uppercase text-graphite">
              Filed 14 March 2024
            </p>
            <p className="font-mono text-xs mt-[6px] text-ink-2">
              London · Mumbai · New York
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default function AboutPage() {
  return (
    <>
      <AboutHero />
      <Manifesto />
    </>
  )
}
