import { layout, escape } from '../layout'

export interface TicketResolvedData {
  ticket_id: string
  subject:   string
  resolution_summary?: string
}

export function renderTicketResolved(data: TicketResolvedData): { subject: string; html: string } {
  const subject = `Ticket resolved · #${data.ticket_id.slice(0, 8)}`

  const body = `
    <h1 style="margin:0 0 8px;font-family:'Libre Baskerville',Georgia,serif;font-size:26px;color:#141414;">Your ticket is resolved.</h1>
    <p style="margin:0 0 24px;font-size:15px;color:#6B6B6B;">
      If anything's still off, reply to this email and we'll reopen the ticket.
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

    ${
      data.resolution_summary
        ? `<div style="margin-top:24px;padding:16px;background:#EFF2F0;border:1px solid #D8DED9;border-radius:2px;font-size:14px;color:#4A5E4E;line-height:1.6;">${escape(data.resolution_summary)}</div>`
        : ''
    }
  `

  return { subject, html: layout({ title: 'Ticket resolved', preview: `Ticket #${data.ticket_id.slice(0, 8)} resolved`, body }) }
}
