import { layout, escape, formatInr } from '../layout'

export interface OrderConfirmationData {
  order_number: string
  contact_email: string
  items: { product_name: string; variant_sku: string; quantity: number; line_total: number }[]
  subtotal:       number
  shipping_total: number
  total:          number
  shipping_address: { line1: string; line2?: string | null; city: string; state: string; pin: string }
  order_url?:     string
}

export function renderOrderConfirmation(data: OrderConfirmationData): { subject: string; html: string } {
  const subject = `Order confirmed · ${data.order_number}`

  const itemsRows = data.items
    .map(
      (i) => `
        <tr>
          <td style="padding:8px 0;border-bottom:1px solid #EBEBEB;">
            <div style="font-size:15px;color:#141414;">${escape(i.product_name)}</div>
            <div style="font-family:monospace;font-size:10px;color:#A3A3A3;text-transform:uppercase;letter-spacing:0.15em;">${escape(i.variant_sku)} · Qty ${i.quantity}</div>
          </td>
          <td align="right" style="padding:8px 0;border-bottom:1px solid #EBEBEB;font-size:15px;color:#141414;white-space:nowrap;">
            ${formatInr(i.line_total)}
          </td>
        </tr>`,
    )
    .join('')

  const addr = data.shipping_address
  const body = `
    <h1 style="margin:0 0 8px;font-family:'Libre Baskerville',Georgia,serif;font-size:26px;color:#141414;">Thank you for your order.</h1>
    <p style="margin:0 0 24px;font-size:15px;color:#6B6B6B;">
      We've received your order and will start preparing it shortly. A second email will follow once it ships.
    </p>

    <div style="font-family:monospace;font-size:10px;color:#A3A3A3;text-transform:uppercase;letter-spacing:0.15em;margin-bottom:4px;">Order number</div>
    <div style="font-family:monospace;font-size:14px;color:#141414;margin-bottom:24px;">${escape(data.order_number)}</div>

    <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
      ${itemsRows}
      <tr>
        <td style="padding:12px 0 0;font-family:monospace;font-size:10px;color:#6B6B6B;text-transform:uppercase;letter-spacing:0.15em;">Subtotal</td>
        <td align="right" style="padding:12px 0 0;font-size:14px;color:#141414;">${formatInr(data.subtotal)}</td>
      </tr>
      <tr>
        <td style="padding:4px 0;font-family:monospace;font-size:10px;color:#6B6B6B;text-transform:uppercase;letter-spacing:0.15em;">Shipping</td>
        <td align="right" style="padding:4px 0;font-size:14px;color:#141414;">${data.shipping_total === 0 ? 'Free' : formatInr(data.shipping_total)}</td>
      </tr>
      <tr>
        <td style="padding:8px 0;border-top:1px solid #D6D6D6;font-family:'Libre Baskerville',Georgia,serif;font-size:18px;color:#141414;">Total</td>
        <td align="right" style="padding:8px 0;border-top:1px solid #D6D6D6;font-family:'Libre Baskerville',Georgia,serif;font-size:18px;color:#141414;">${formatInr(data.total)}</td>
      </tr>
    </table>

    <h2 style="margin:32px 0 8px;font-family:'Libre Baskerville',Georgia,serif;font-size:16px;color:#141414;">Shipping to</h2>
    <address style="font-style:normal;font-size:14px;color:#141414;line-height:1.5;">
      ${escape(addr.line1)}<br />
      ${addr.line2 ? `${escape(addr.line2)}<br />` : ''}
      ${escape(addr.city)}, ${escape(addr.state)} ${escape(addr.pin)}<br />
      India
    </address>

    ${
      data.order_url
        ? `<div style="margin-top:32px;"><a href="${escape(data.order_url)}" style="display:inline-block;background:#141414;color:#FFFFFF;text-decoration:none;font-family:monospace;font-size:10px;text-transform:uppercase;letter-spacing:0.15em;padding:12px 20px;border-radius:2px;">View order</a></div>`
        : ''
    }
  `

  return { subject, html: layout({ title: 'Order confirmed', preview: `Order ${data.order_number} confirmed — ${formatInr(data.total)}`, body }) }
}
