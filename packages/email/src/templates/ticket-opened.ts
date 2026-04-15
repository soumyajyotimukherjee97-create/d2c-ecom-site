import { layout, escape } from '../layout'

export interface TicketOpenedData {
  ticket_id: string
  subject:   string
  response_sla_hours?: number
}

export function renderTicketOpened(data: TicketOpenedData): { subject: string; html: string } {
  const sla     = data.response_sla_hours ?? 24
  const subject = `Ticket received · #${data.ticket_id.slice(0, 8)}`

  const body = `
    <h1 style="margin:0 0 8px;font-family:'Libre Baskerville',Georgia,serif;font-size:26px;color:#141414;">We received your message.</h1>
    <p style="margin:0 0 24px;font-size:15px;color:#6B6B6B;">
      A team member will respond within <strong>${sla} hours</strong>. Keep this email handy so you can reply with any follow-ups.
    </p>

    <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
      <tr>
        <td style="padding:8px 0;font-family:monospace;font-size:10px;color:#A3A3A3;text-transform:uppercase;letter-spacing:0.15em;width:100px;">Ticket</td>
        <td style="padding:8px 0;font-family:monospace;font-size:14px;color:#141414;">#${escape(data.ticket_id.slice(0, 8))}</td>
      </tr>
      <tr>
        <td style="padding:8px 0;font-family:monospace;font-size:10px;color:#A3A3A3;text-transform:uppercase;letter-spacing:0.15em;vertical-align:top;">Subject</td>
        <td style="padding:8px 0;font-size:14px;color:#141414;">${escape(data.subject)}</td>
      </tr>
    </table>
  `

  return { subject, html: layout({ title: 'Ticket opened', preview: `Ticket #${data.ticket_id.slice(0, 8)} received`, body }) }
}
