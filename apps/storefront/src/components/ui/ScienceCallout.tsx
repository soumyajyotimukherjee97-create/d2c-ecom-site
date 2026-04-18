import { ReactNode } from 'react'

export interface ScienceCalloutProps {
  children: ReactNode
  className?: string
}

/**
 * Paper-2 block with a hairline frame — used for "clinical insight"
 * sidecar callouts on PDP and ingredient essays. Matches
 * wireframes/Pdp.html CLINICAL INSIGHT treatment.
 */
export function ScienceCallout({ children, className = '' }: ScienceCalloutProps) {
  return (
    <div
      data-testid="science-callout"
      className={[
        'border border-hairline bg-paper-2 px-5 py-4',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </div>
  )
}
