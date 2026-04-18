import type { OrderStatus } from '@/types'

const STATUS_LABELS: Record<OrderStatus, string> = {
  confirmed:  'CONFIRMED',
  processing: 'PROCESSING',
  shipped:    'SHIPPED',
  delivered:  'DELIVERED',
  cancelled:  'CANCELLED',
}

// Matter mono-caps square chip. Colour keyed to status semantics:
//   confirmed  — ink       (live, active)
//   processing — graphite  (in flight, neutral)
//   shipped    — assay     (in motion toward customer)
//   delivered  — hairline  (closed, positive)
//   cancelled  — oxblood   (closed, negative)
const STATUS_CLASSES: Record<OrderStatus, string> = {
  confirmed:  'text-ink border-ink',
  processing: 'text-graphite border-graphite',
  shipped:    'text-assay-ink border-assay',
  delivered:  'text-graphite border-hairline',
  cancelled:  'text-oxblood border-oxblood',
}

const STATUS_DOT_CLASSES: Record<OrderStatus, string> = {
  confirmed:  'bg-ink',
  processing: 'bg-graphite',
  shipped:    'bg-assay',
  delivered:  'bg-hairline',
  cancelled:  'bg-oxblood',
}

/**
 * Matter status chip — square (no radius), 1px border keyed to status,
 * mono-caps label with leading indicator dot. Renders consistently
 * across Account orders table, /order/[id] info strip, and any other
 * order-state surface. Aliased as `StatusChip` in the barrel export.
 */
export function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span
      data-testid="status-badge"
      data-status={status}
      className={[
        'inline-flex items-center gap-2 whitespace-nowrap',
        'font-mono text-2xs uppercase tracking-widest',
        'px-2.5 py-1 border bg-transparent',
        STATUS_CLASSES[status],
      ].join(' ')}
    >
      <span
        aria-hidden="true"
        className={['inline-block w-1.5 h-1.5 rounded-full', STATUS_DOT_CLASSES[status]].join(' ')}
      />
      {STATUS_LABELS[status]}
    </span>
  )
}

export { StatusBadge as StatusChip }
