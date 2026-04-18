import { ElementType, ReactNode } from 'react'

export interface EyebrowProps {
  children: ReactNode
  as?: ElementType
  className?: string
}

/**
 * Mono-caps eyebrow — the "§ II — Featured formulas" caption used to
 * open every matter section. Renders with font-mono, 10px, tracking
 * 0.14em, uppercase, graphite colour.
 */
export function Eyebrow({ children, as: Tag = 'span', className = '' }: EyebrowProps) {
  return (
    <Tag
      data-testid="eyebrow"
      className={[
        'font-mono text-xs tracking-widest uppercase text-graphite',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </Tag>
  )
}
