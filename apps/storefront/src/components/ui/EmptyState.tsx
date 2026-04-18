interface EmptyStateProps {
  heading: string
  body: string
  actions?: React.ReactNode
}

/**
 * Matter empty-state pattern — mono caption lead with em-dash, then
 * display-font body, then action slot. Centered with generous padding.
 * Example: "— No formulas match your filters. Adjust your selection."
 */
export function EmptyState({ heading, body, actions }: EmptyStateProps) {
  return (
    <div data-testid="empty-state" className="text-center py-24 px-6">
      <p className="font-mono text-2xs uppercase tracking-widest text-graphite mb-4">
        — {heading}
      </p>
      <p className="font-body text-base text-ink-2 mb-8 max-w-md mx-auto">{body}</p>
      {actions && <div className="flex justify-center gap-3">{actions}</div>}
    </div>
  )
}
