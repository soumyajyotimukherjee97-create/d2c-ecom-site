import { layout, escape } from '../layout'

export interface OrderShippedData {
  order_number: string
  carrier:      string
  tracking_id:  string
  estimated_delivery?: string
  tracking_url?:       string
}

export function renderOrderShipped(data: OrderShippedData): { subject: string; html: string } {
  const subject = `Your order has shipped · ${data.order_number}`

  const body = `
    <h1 style="margin:0 0 8px;font-family:'Libre Baskerville',Georgia,serif;font-size:26px;color:#141414;">On its way.</h1>
    <p style="margin:0 0 24px;font-size:15px;color:#6B6B6B;">
      Your order is with the courier and should arrive soon${data.estimated_delivery ? ` — estimated delivery ${escape(data.estimated_delivery)}` : ''}.
    </p>

    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin:0 0 24px;">
      <tr>
        <td style="padding:8px 0;font-family:monospace;font-size:10px;color:#A3A3A3;text-transform:uppercase;letter-spacing:0.15em;width:100px;">Order</td>
        <td style="padding:8px 0;font-family:monospace;font-size:14px;color:#141414;">${escape(data.order_number)}</td>
      </tr>
      <tr>
        <td style="padding:8px 0;font-family:monospace;font-size:10px;color:#A3A3A3;text-transform:uppercase;letter-spacing:0.15em;">Carrier</td>
        <td style="padding:8px 0;font-size:14px;color:#141414;">${escape(data.carrier)}</td>
      </tr>
      <tr>
        <td style="padding:8px 0;font-family:monospace;font-size:10px;color:#A3A3A3;text-transform:uppercase;letter-spacing:0.15em;">Tracking</td>
        <td style="padding:8px 0;font-family:monospace;font-size:14px;color:#141414;">${escape(data.tracking_id)}</td>
      </tr>
    </table>

    ${
      data.tracking_url
        ? `<div><a href="${escape(data.tracking_url)}" style="display:inline-block;background:#141414;color:#FFFFFF;text-decoration:none;font-family:monospace;font-size:10px;text-transform:uppercase;letter-spacing:0.15em;padding:12px 20px;border-radius:2px;">Track package</a></div>`
        : ''
    }
  `

  return { subject, html: layout({ title: 'Order shipped', preview: `Tracking ${data.tracking_id} · ${data.carrier}`, body }) }
}
