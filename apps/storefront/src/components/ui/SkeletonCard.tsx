export interface SkeletonCardProps {
  /** Number of text line placeholders below the image block */
  lines?: number
  className?: string
}

/**
 * Matter skeleton — striped tonal block for the image area, then
 * hairline text-line placeholders. Matches m-ph variant used across
 * the storefront while data loads. No shadows, no radii.
 */
export function SkeletonCard({ lines = 3, className = '' }: SkeletonCardProps) {
  return (
    <div
      aria-hidden="true"
      data-testid="skeleton-card"
      className={['animate-pulse', className].filter(Boolean).join(' ')}
    >
      {/* Image block — striped tonal placeholder */}
      <div className="m-ph w-full aspect-square mb-4" />

      {/* Text lines — last line is shorter to look natural */}
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={[
            'h-3 bg-hairline/60',
            i < lines - 1 ? 'mb-2 w-full' : 'w-1/2',
          ].join(' ')}
        />
      ))}
    </div>
  )
}
