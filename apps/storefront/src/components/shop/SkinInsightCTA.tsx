import Link from 'next/link'

type MarkerAlign = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'

function Marker({
  x,
  y,
  label,
  value,
  align = 'top-right',
}: {
  x:      string
  y:      string
  label:  string
  value:  string
  align?: MarkerAlign
}) {
  const isBottom = align.startsWith('bottom')
  const isRight  = align.endsWith('right')
  return (
    <div
      className="absolute -translate-x-1/2 -translate-y-1/2"
      style={{ top: y, left: x }}
    >
      {/* dot */}
      <span
        aria-hidden="true"
        className="block w-2 h-2 rounded-full bg-ink ring-[3px] ring-paper"
      />
      {/* crosshair ticks */}
      <span
        aria-hidden="true"
        className="absolute left-1/2 top-1/2 w-[18px] h-px bg-ink/25 -translate-x-1/2 -translate-y-1/2"
      />
      <span
        aria-hidden="true"
        className="absolute left-1/2 top-1/2 w-px h-[18px] bg-ink/25 -translate-x-1/2 -translate-y-1/2"
      />
      {/* label pill */}
      <div
        className={[
          'absolute flex items-center gap-2 font-mono text-[10px] tracking-wide px-2 py-1',
          'bg-paper border border-ink whitespace-nowrap',
          isBottom ? 'top-[18px]' : 'bottom-[18px]',
          isRight  ? 'left-[14px]' : 'right-[14px]',
        ].join(' ')}
      >
        <span className="text-ink">{label}</span>
        <span aria-hidden="true" className="w-px h-2.5 bg-hairline" />
        <span className="text-graphite uppercase tracking-widest text-[9px]">
          {value}
        </span>
      </div>
    </div>
  )
}

function HeatmapFigure() {
  return (
    <figure
      data-testid="skin-insight-heatmap"
      className="bg-paper-2 border border-hairline aspect-[4/3] p-8 md:p-9 pb-10 flex flex-col"
    >
      <div className="flex justify-between">
        <div>
          <p className="font-mono text-[9px] tracking-[0.2em] uppercase text-graphite">
            Fig. 026 — Concern density map
          </p>
          <p className="font-mono text-[9px] tracking-widest text-graphite mt-1">
            Subject 026 · 11 markers indexed
          </p>
        </div>
        <span className="font-mono text-[9px] tracking-[0.2em] uppercase text-graphite">
          AI · Analysis
        </span>
      </div>

      <div className="relative flex-1 mt-5 border border-hairline bg-paper">
        <svg
          viewBox="0 0 120 80"
          preserveAspectRatio="none"
          aria-hidden="true"
          className="absolute inset-0 w-full h-full"
        >
          {/* Faint grid */}
          {Array.from({ length: 11 }, (_, i) => (
            <line
              key={`v${i}`}
              x1={(i + 1) * 10}
              y1="0"
              x2={(i + 1) * 10}
              y2="80"
              stroke="currentColor"
              strokeWidth="0.15"
              className="text-hairline"
              opacity="0.5"
            />
          ))}
          {Array.from({ length: 7 }, (_, i) => (
            <line
              key={`h${i}`}
              x1="0"
              y1={(i + 1) * 10}
              x2="120"
              y2={(i + 1) * 10}
              stroke="currentColor"
              strokeWidth="0.15"
              className="text-hairline"
              opacity="0.5"
            />
          ))}
          {/* Heatmap clusters */}
          <ellipse cx="28" cy="28" rx="14" ry="9"  className="fill-ink" opacity="0.06" />
          <ellipse cx="28" cy="28" rx="8"  ry="5"  className="fill-ink" opacity="0.10" />
          <ellipse cx="75" cy="35" rx="10" ry="7"  className="fill-ink" opacity="0.06" />
          <ellipse cx="75" cy="35" rx="5"  ry="3"  className="fill-ink" opacity="0.10" />
          <ellipse cx="50" cy="56" rx="16" ry="8"  className="fill-ink" opacity="0.05" />
          <ellipse cx="50" cy="56" rx="9"  ry="4"  className="fill-ink" opacity="0.08" />
          <ellipse cx="92" cy="60" rx="9"  ry="6"  className="fill-ink" opacity="0.06" />
          <ellipse cx="92" cy="60" rx="4"  ry="2.5" className="fill-ink" opacity="0.10" />
        </svg>

        <Marker x="23%" y="35%" label="Pigmentation" value="High"  align="top-left" />
        <Marker x="62%" y="44%" label="Pores"        value="Med"   align="top-right" />
        <Marker x="42%" y="70%" label="Fine lines"   value="Low"   align="bottom-left" />
        <Marker x="77%" y="68%" label="Acne"         value="Med"   align="top-right" />

        <span className="absolute left-2.5 top-2.5 font-mono text-[8px] tracking-widest uppercase text-graphite">
          T-zone
        </span>
        <span className="absolute right-2.5 bottom-1.5 font-mono text-[8px] tracking-widest uppercase text-graphite">
          U-zone
        </span>
      </div>

      <figcaption className="flex justify-between mt-4 font-mono text-[9px] tracking-widest uppercase text-graphite">
        <span>Specimen · Subject 026</span>
        <span>Confidence — 96.4%</span>
      </figcaption>
    </figure>
  )
}

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
          <HeatmapFigure />

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
