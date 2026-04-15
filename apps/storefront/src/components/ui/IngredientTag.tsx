export interface IngredientTagProps {
  name: string
  /** Concentration percentage, e.g. 2.00 */
  concentration?: number | null
  className?: string
}

/** Left-bordered tag used in ingredient lists on PDPs. */
export function IngredientTag({ name, concentration, className = '' }: IngredientTagProps) {
  return (
    <div
      data-testid="ingredient-tag"
      className={['ingredient-tag', className].filter(Boolean).join(' ')}
    >
      <span className="font-body text-sm font-medium text-gray-900">{name}</span>
      {concentration != null && (
        <span className="font-mono text-2xs text-gray-400 ml-auto">
          {concentration}%
        </span>
      )}
    </div>
  )
}
