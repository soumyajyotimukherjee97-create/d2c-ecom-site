import { layout, escape } from '../layout'

export interface OrderDeliveredData {
  order_number: string
  review_url?:  string
  reorder_url?: string
}

export function renderOrderDelivered(data: OrderDeliveredData): { subject: string; html: string } {
  const subject = `Delivered · ${data.order_number}`

  const body = `
    <h1 style="margin:0 0 8px;font-family:'Libre Baskerville',Georgia,serif;font-size:26px;color:#141414;">Your order arrived.</h1>
    <p style="margin:0 0 24px;font-size:15px;color:#6B6B6B;">
      We hope you're happy with it. A quick review helps other customers — and running low? One-click reorder keeps the routine going.
    </p>

    <div style="font-family:monospace;font-size:10px;color:#A3A3A3;text-transform:uppercase;letter-spacing:0.15em;margin-bottom:4px;">Order number</div>
    <div style="font-family:monospace;font-size:14px;color:#141414;margin-bottom:24px;">${escape(data.order_number)}</div>

    <table role="presentation" cellpadding="0" cellspacing="0">
      <tr>
        ${
          data.review_url
            ? `<td style="padding-right:8px;"><a href="${escape(data.review_url)}" style="display:inline-block;background:#141414;color:#FFFFFF;text-decoration:none;font-family:monospace;font-size:10px;text-transform:uppercase;letter-spacing:0.15em;padding:12px 20px;border-radius:2px;">Leave a review</a></td>`
            : ''
        }
        ${
          data.reorder_url
            ? `<td><a href="${escape(data.reorder_url)}" style="display:inline-block;border:1px solid #141414;color:#141414;text-decoration:none;font-family:monospace;font-size:10px;text-transform:uppercase;letter-spacing:0.15em;padding:11px 20px;border-radius:2px;">Reorder</a></td>`
            : ''
        }
      </tr>
    </table>
  `

  return { subject, html: layout({ title: 'Order delivered', preview: `Order ${data.order_number} delivered`, body }) }
}
