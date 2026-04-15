export interface SkeletonCardProps {
  /** Number of text line placeholders below the image block */
  lines?: number
  className?: string
}

export function SkeletonCard({ lines = 3, className = '' }: SkeletonCardProps) {
  return (
    <div
      aria-hidden="true"
      data-testid="skeleton-card"
      className={[
        'border border-gray-100 rounded-md p-4 animate-pulse bg-white',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {/* Image block */}
      <div className="w-full aspect-square bg-gray-100 rounded-sm mb-4" />

      {/* Text lines — last line is shorter to look natural */}
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={[
            'h-3 bg-gray-100 rounded-sm',
            i < lines - 1 ? 'mb-2 w-full' : 'w-1/2',
          ].join(' ')}
        />
      ))}
    </div>
  )
}
