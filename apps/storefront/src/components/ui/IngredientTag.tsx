export interface IngredientTagProps {
  name: string
  /** Concentration percentage, e.g. 2.00 */
  concentration?: number | null
  className?: string
}

/**
 * PDP ingredient row — 3px left ink border signature pattern, 1px
 * hairline frame, ingredient name left, concentration right.
 * Matches wireframes/Pdp.html "KEY INGREDIENTS" rows.
 */
export function IngredientTag({ name, concentration, className = '' }: IngredientTagProps) {
  return (
    <div
      data-testid="ingredient-tag"
      className={[
        'flex items-center justify-between',
        'px-3.5 py-3',
        'border border-hairline border-l-[3px] border-l-ink bg-paper',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <span className="font-body text-sm text-ink">{name}</span>
      {concentration != null && (
        <span className="font-mono text-xs text-graphite tabular-nums">
          {concentration}%
        </span>
      )}
    </div>
  )
}
