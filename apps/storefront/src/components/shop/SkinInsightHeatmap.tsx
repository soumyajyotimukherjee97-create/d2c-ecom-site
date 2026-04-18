// Decorative concern-density heatmap figure. Shown on PLP (inside
// SkinInsightCTA) and on the /skin-insight coming-soon page.
// No user data is processed here — the markers + subject numbers are
// brand-persona illustration, not real trial data.

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
      <span
        aria-hidden="true"
        className="block w-2 h-2 rounded-full bg-ink ring-[3px] ring-paper"
      />
      <span
        aria-hidden="true"
        className="absolute left-1/2 top-1/2 w-[18px] h-px bg-ink/25 -translate-x-1/2 -translate-y-1/2"
      />
      <span
        aria-hidden="true"
        className="absolute left-1/2 top-1/2 w-px h-[18px] bg-ink/25 -translate-x-1/2 -translate-y-1/2"
      />
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

export function SkinInsightHeatmap() {
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
