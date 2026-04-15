import type { OrderStatus } from '@/lib/api/schemas/orders'

const STYLES: Record<OrderStatus, string> = {
  confirmed:  'bg-mist text-mist-text border-mist-border',
  processing: 'bg-mist text-mist-text border-mist-border',
  shipped:    'bg-blush text-blush-text border-blush-border',
  delivered:  'bg-gray-100 text-gray-900 border-gray-200',
  cancelled:  'bg-gray-100 text-error border-error',
}

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span
      data-testid={`order-status-${status}`}
      className={`inline-block border rounded-sm px-2 py-0.5 font-mono text-2xs uppercase tracking-wider ${STYLES[status]}`}
    >
      {status}
    </span>
  )
}
