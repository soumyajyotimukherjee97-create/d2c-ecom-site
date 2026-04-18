import { CSSProperties } from 'react'

export type PlaceholderVariant = 'default' | 'ink' | 'mineral'

export interface PlaceholderProps {
  /** Top caption — usually a specimen label e.g. "SPECIMEN · 01" */
  label?: string
  /** Bottom-right caption — usually a descriptor e.g. "serum 30ml" */
  caption?: string
  variant?: PlaceholderVariant
  /** CSS aspect-ratio value, e.g. '3 / 4' (default), '1 / 1', '4 / 5' */
  ratio?: string
  className?: string
  style?: CSSProperties
}

const variantClasses: Record<PlaceholderVariant, string> = {
  default: 'm-ph',
  ink:     'm-ph m-ph--ink',
  mineral: 'm-ph m-ph--mineral',
}

/**
 * Striped tonal placeholder — a stand-in for product photography
 * until real art ships. Matches matter.css .m-ph patterns.
 * Captions are uppercase mono. Always bordered with a hairline
 * (or ink for the `ink` variant).
 */
export function Placeholder({
  label,
  caption,
  variant = 'default',
  ratio = '3 / 4',
  className = '',
  style,
}: PlaceholderProps) {
  return (
    <div
      data-testid="placeholder"
      data-variant={variant}
      className={[variantClasses[variant], 'relative overflow-hidden', className]
        .filter(Boolean)
        .join(' ')}
      style={{ aspectRatio: ratio, ...style }}
    >
      {(label || caption) && (
        <div className="absolute bottom-3 left-3 right-3 flex justify-between gap-2 font-mono text-[9px] tracking-widest uppercase">
          {label && <span>{label}</span>}
          {caption && <span>{caption}</span>}
        </div>
      )}
    </div>
  )
}
