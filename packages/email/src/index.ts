import { sendEmail } from './send'
import { renderOrderConfirmation, type OrderConfirmationData } from './templates/order-confirmation'
import { renderOrderShipped,      type OrderShippedData }      from './templates/order-shipped'
import { renderOrderDelivered,    type OrderDeliveredData }    from './templates/order-delivered'
import { renderTicketOpened,      type TicketOpenedData }      from './templates/ticket-opened'
import { renderTicketResolved,    type TicketResolvedData }    from './templates/ticket-resolved'

export { sendEmail } from './send'
export type { EmailPayload, EmailResult } from './send'
export { renderOrderConfirmation } from './templates/order-confirmation'
export { renderOrderShipped }      from './templates/order-shipped'
export { renderOrderDelivered }    from './templates/order-delivered'
export { renderTicketOpened }      from './templates/ticket-opened'
export { renderTicketResolved }    from './templates/ticket-resolved'
export type {
  OrderConfirmationData,
  OrderShippedData,
  OrderDeliveredData,
  TicketOpenedData,
  TicketResolvedData,
}

// ─── Convenience senders ─────────────────────────────────────────────────────

export function sendOrderConfirmation(to: string, data: OrderConfirmationData) {
  const { subject, html } = renderOrderConfirmation(data)
  return sendEmail({ to, subject, html })
}

export function sendOrderShipped(to: string, data: OrderShippedData) {
  const { subject, html } = renderOrderShipped(data)
  return sendEmail({ to, subject, html })
}

export function sendOrderDelivered(to: string, data: OrderDeliveredData) {
  const { subject, html } = renderOrderDelivered(data)
  return sendEmail({ to, subject, html })
}

export function sendTicketOpened(to: string, data: TicketOpenedData) {
  const { subject, html } = renderTicketOpened(data)
  return sendEmail({ to, subject, html })
}

export function sendTicketResolved(to: string, data: TicketResolvedData) {
  const { subject, html } = renderTicketResolved(data)
  return sendEmail({ to, subject, html })
}
