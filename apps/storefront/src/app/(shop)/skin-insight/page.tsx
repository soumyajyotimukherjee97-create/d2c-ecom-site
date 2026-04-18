import type { Metadata } from 'next'
import Link from 'next/link'
import { SkinInsightHeatmap } from '@/components/shop/SkinInsightHeatmap'
import { NewsletterForm } from '@/components/shop/NewsletterForm'

export const metadata: Metadata = {
  title:       'SkinInsight · matter',
  description:
    'Coming in Phase 2. A 30-second facial scan that indexes eleven concern markers and prescribes a routine from the matter formulary.',
}

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
                'July', 'August', 'September', 'October', 'November', 'December']

function formatToday(): string {
  const d = new Date()
  return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`
}

const MANIFEST = [
  ['01 Scan',       '30 seconds, front-facing camera. No app — web only.'],
  ['02 Diagnose',   'Eleven markers indexed: pigmentation, pores, acne, fine lines, and more.'],
  ['03 Prescribe',  'A routine drawn from the matter formulary — specified by concentration.'],
] as const

export default function SkinInsightPage() {
  return (
    <>
      {/* ── Broadsheet masthead ─────────────────────────────────────────── */}
      <header
        data-testid="skin-insight-masthead"
        className="bg-paper border-b-[3px] border-double border-ink"
      >
        <div className="max-w-container mx-auto px-8 md:px-12 pt-7 pb-4">
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-6 font-mono text-2xs tracking-ultra uppercase">
            <span className="text-graphite justify-self-start">Vol. I · No. 01</span>
            <span className="text-ink text-xs tracking-[0.3em] whitespace-nowrap">
              Skin Insight · Pending Dispatch
            </span>
            <span className="text-graphite justify-self-end whitespace-nowrap">
              Phase 2 · {formatToday()}
            </span>
          </div>
        </div>
      </header>

      {/* ── Editorial hero ──────────────────────────────────────────────── */}
      <section
        aria-labelledby="skin-insight-heading"
        data-testid="skin-insight-hero"
        className="bg-paper border-b border-hairline"
      >
        <div className="max-w-container mx-auto px-8 py-20 text-center">
          <p
            data-testid="skin-insight-eyebrow"
            className="inline-block font-mono text-2xs tracking-ultra uppercase text-graphite"
          >
            § Coming soon — Phase 2
          </p>
          <h1
            id="skin-insight-heading"
            data-testid="skin-insight-title"
            className="font-display font-normal text-[clamp(48px,7vw,104px)] leading-[0.96] tracking-tightest mt-5 max-w-[16ch] mx-auto"
          >
            A skin report, by <em className="italic">your</em> skin.
          </h1>
          <p className="font-body text-base leading-[1.6] text-ink-2 max-w-[560px] mx-auto mt-7">
            Scan your face in 30 seconds. A clinical-grade model indexes
            pigmentation, pores, acne, and early signs of aging — then
            prescribes a routine from the matter formulary.
          </p>
        </div>
      </section>

      {/* ── Body: heatmap + manifest + waitlist ─────────────────────────── */}
      <section
        aria-label="How it will work"
        data-testid="skin-insight-body"
        className="bg-paper-2 border-b border-hairline"
      >
        <div className="max-w-container mx-auto px-8 py-20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 items-start">
            <SkinInsightHeatmap />

            <div>
              <p className="font-mono text-2xs tracking-ultra uppercase text-graphite">
                § The brief
              </p>
              <h2 className="font-display font-normal text-[clamp(32px,3.5vw,44px)] leading-[1.05] tracking-tighter mt-3.5">
                How it will <em className="italic">work</em>.
              </h2>

              <ul
                data-testid="skin-insight-manifest"
                className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-9"
              >
                {MANIFEST.map(([heading, body]) => (
                  <li key={heading} data-testid="skin-insight-manifest-item">
                    <p className="font-mono text-[10px] tracking-[0.18em] uppercase text-graphite">
                      {heading}
                    </p>
                    <p className="font-body text-[14px] leading-[1.55] text-ink-2 mt-2">
                      {body}
                    </p>
                  </li>
                ))}
              </ul>

              <div
                data-testid="skin-insight-waitlist"
                className="mt-12 pt-8 border-t border-hairline"
              >
                <p className="font-mono text-[10px] tracking-[0.18em] uppercase text-graphite">
                  § Notify me
                </p>
                <h3 className="font-display text-[clamp(24px,2.4vw,28px)] text-ink mt-2.5">
                  Be the first subject.
                </h3>
                <p className="font-body text-[13px] leading-[1.55] text-ink-2 mt-2 max-w-[360px]">
                  We will dispatch a single note when SkinInsight is ready.
                  No marketing, no cadence.
                </p>
                <div className="mt-5">
                  <NewsletterForm />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Secondary CTA: back to shop ─────────────────────────────────── */}
      <section
        aria-label="Return to shop"
        data-testid="skin-insight-return"
        className="bg-paper border-b border-hairline"
      >
        <div className="max-w-container mx-auto px-8 py-14 text-center">
          <Link
            href="/products"
            data-testid="skin-insight-back-to-shop"
            className="inline-flex items-center font-mono text-[11px] tracking-widest uppercase px-6 py-4 border border-hairline text-ink hover:border-ink transition-colors focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-ink focus-visible:outline-offset-2"
          >
            ← Back to the formulary
          </Link>
        </div>
      </section>
    </>
  )
}
