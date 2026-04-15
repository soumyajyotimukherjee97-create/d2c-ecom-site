import { Badge, type BadgeVariant } from './Badge'
import type { OrderStatus } from '@/types'

const STATUS_LABELS: Record<OrderStatus, string> = {
  confirmed:  'Confirmed',
  processing: 'Processing',
  shipped:    'Shipped',
  delivered:  'Delivered',
  cancelled:  'Cancelled',
}

const STATUS_VARIANTS: Record<OrderStatus, BadgeVariant> = {
  confirmed:  'mist',
  processing: 'mist',
  shipped:    'mist',
  delivered:  'default',
  cancelled:  'error',
}

export function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <Badge variant={STATUS_VARIANTS[status]} className="whitespace-nowrap">
      <span data-testid="status-badge">{STATUS_LABELS[status]}</span>
    </Badge>
  )
}
