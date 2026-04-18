export interface RulerProps {
  /** Number of columns. Default 12. */
  columns?: number
  className?: string
}

/**
 * Decorative "lab ruler" — 01 02 03 … numbered mono captions between
 * two soft hairlines. Optional ornament at the top of editorial
 * sections (matter.css: .m-ruler). Purely visual; aria-hidden.
 */
export function Ruler({ columns = 12, className = '' }: RulerProps) {
  return (
    <div
      aria-hidden="true"
      data-testid="ruler"
      className={[
        'grid gap-6 py-1.5',
        'border-t border-b border-hairline/50',
        'font-mono text-[9px] tracking-widest uppercase text-graphite/60',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
    >
      {Array.from({ length: columns }, (_, i) => (
        <span key={i}>{String(i + 1).padStart(2, '0')}</span>
      ))}
    </div>
  )
}
