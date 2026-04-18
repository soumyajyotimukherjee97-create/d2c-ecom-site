import { ElementType, ReactNode } from 'react'

export type MonoCaptionTone = 'graphite' | 'ink' | 'assay' | 'oxblood' | 'paper'

export interface MonoCaptionProps {
  children: ReactNode
  as?: ElementType
  tone?: MonoCaptionTone
  uppercase?: boolean
  className?: string
}

const toneClasses: Record<MonoCaptionTone, string> = {
  graphite: 'text-graphite',
  ink:      'text-ink',
  assay:    'text-assay-ink',
  oxblood:  'text-oxblood',
  paper:    'text-paper',
}

/**
 * Mono caption — smaller, more generic than Eyebrow. Used for specs,
 * pH values, dates, verified labels. Default: graphite, mixed-case.
 * Pass uppercase={true} for mono-caps labels.
 */
export function MonoCaption({
  children,
  as: Tag = 'span',
  tone = 'graphite',
  uppercase = false,
  className = '',
}: MonoCaptionProps) {
  return (
    <Tag
      data-testid="mono-caption"
      data-tone={tone}
      className={[
        'font-mono text-2xs tracking-wide',
        toneClasses[tone],
        uppercase ? 'uppercase tracking-widest' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </Tag>
  )
}
