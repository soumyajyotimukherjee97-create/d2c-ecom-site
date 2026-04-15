import type { TicketStatus, TicketPriority } from '@/lib/api/schemas/support'

const STATUS_STYLES: Record<TicketStatus, string> = {
  open:        'bg-mist text-mist-text border-mist-border',
  in_progress: 'bg-blush text-blush-text border-blush-border',
  resolved:    'bg-gray-100 text-gray-900 border-gray-200',
  closed:      'bg-gray-100 text-gray-600 border-gray-200',
}

const PRIORITY_STYLES: Record<TicketPriority, string> = {
  low:    'bg-gray-100 text-gray-600 border-gray-200',
  normal: 'bg-mist text-mist-text border-mist-border',
  high:   'bg-blush text-blush-text border-blush-border',
  urgent: 'bg-gray-100 text-error border-error',
}

export function TicketStatusBadge({ status }: { status: TicketStatus }) {
  return (
    <span
      data-testid={`ticket-status-${status}`}
      className={`inline-block border rounded-sm px-2 py-0.5 font-mono text-2xs uppercase tracking-wider ${STATUS_STYLES[status]}`}
    >
      {status.replace('_', ' ')}
    </span>
  )
}

export function TicketPriorityBadge({ priority }: { priority: TicketPriority }) {
  return (
    <span
      data-testid={`ticket-priority-${priority}`}
      className={`inline-block border rounded-sm px-2 py-0.5 font-mono text-2xs uppercase tracking-wider ${PRIORITY_STYLES[priority]}`}
    >
      {priority}
    </span>
  )
}
