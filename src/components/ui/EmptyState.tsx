interface EmptyStateProps {
  heading: string
  body: string
  actions?: React.ReactNode
}

export function EmptyState({ heading, body, actions }: EmptyStateProps) {
  return (
    <div
      data-testid="empty-state"
      className="text-center py-24 px-6"
    >
      <p className="font-body text-sm text-gray-900 mb-2">{heading}</p>
      <p className="font-body text-sm text-gray-600 mb-6">{body}</p>
      {actions && <div className="flex justify-center gap-2">{actions}</div>}
    </div>
  )
}
