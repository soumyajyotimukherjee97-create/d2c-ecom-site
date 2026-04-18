import Link from 'next/link'
import { SkinInsightHeatmap } from './SkinInsightHeatmap'

export function SkinInsightCTA() {
  return (
    <section
      id="skininsight"
      data-testid="skin-insight-cta"
      aria-label="SkinInsight — skin analysis quiz"
      className="bg-paper border-t border-hairline"
    >
      <div className="max-w-container mx-auto px-8 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 items-center">
          <SkinInsightHeatmap />

          <div>
            <p className="font-mono text-2xs tracking-[0.2em] uppercase text-graphite">
              § New
            </p>
            <h2 className="font-display font-normal text-[clamp(44px,5vw,68px)] leading-none tracking-tighter mt-4">
              Skin<em className="italic">Insights</em>.
            </h2>
            <p className="font-mono text-xs tracking-wider uppercase text-graphite mt-4">
              Know your skin health, using AI
            </p>
            <p className="font-body text-[15px] leading-[1.65] text-ink-2 max-w-[460px] mt-7">
              Scan your face in 30 seconds. Our clinical-grade model identifies
              pigmentation, pores, acne, and early signs of aging — then
              prescribes a routine from our formulary.
            </p>

            <div className="flex items-center gap-4 mt-9">
              <Link
                href="/skin-insight"
                data-testid="skin-insight-cta-link"
                className="inline-flex items-center gap-2.5 bg-ink text-paper px-6 py-3.5 font-mono text-xs tracking-ultra uppercase hover:bg-ink-2 transition-colors focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-ink focus-visible:outline-offset-2"
              >
                Try now <span aria-hidden="true">→</span>
              </Link>
              <span className="font-mono text-2xs tracking-widest uppercase text-graphite">
                Free · No signup
              </span>
            </div>

            <div className="grid grid-cols-3 mt-10 border-t border-b border-hairline">
              {[
                ['Accuracy', '96.4%'],
                ['Trial n',  '4,812'],
                ['Markers',  '11 indexed'],
              ].map(([k, v], i) => (
                <div
                  key={k}
                  className={`px-4 py-3.5 ${i < 2 ? 'border-r border-hairline/60' : ''}`}
                >
                  <p className="font-mono text-[9px] tracking-widest uppercase text-graphite">
                    {k}
                  </p>
                  <p className="font-mono text-sm text-ink tabular-nums mt-1">
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
