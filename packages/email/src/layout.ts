/**
 * Shared email HTML layout. Inline styles only — most email clients strip or
 * ignore <style> blocks. Neutral palette matches the storefront design system.
 */

export interface LayoutOptions {
  title:   string
  preview: string
  body:    string
}

export function layout({ title, preview, body }: LayoutOptions): string {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>${escape(title)}</title>
  </head>
  <body style="margin:0;padding:0;background:#FAFAFA;font-family:Inter,system-ui,-apple-system,Segoe UI,Roboto,sans-serif;color:#141414;">
    <span style="display:none;opacity:0;visibility:hidden;height:0;width:0;overflow:hidden;">${escape(preview)}</span>
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:#FAFAFA;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" cellpadding="0" cellspacing="0" width="560" style="max-width:560px;background:#FFFFFF;border:1px solid #D6D6D6;border-radius:2px;">
            <tr>
              <td style="padding:32px 32px 16px;border-bottom:1px solid #EBEBEB;">
                <div style="font-family:'Libre Baskerville',Georgia,serif;font-size:22px;color:#141414;letter-spacing:0.02em;">D2C</div>
                <div style="font-family:monospace;font-size:10px;color:#A3A3A3;text-transform:uppercase;letter-spacing:0.15em;margin-top:4px;">${escape(title)}</div>
              </td>
            </tr>
            <tr>
              <td style="padding:32px;">
                ${body}
              </td>
            </tr>
            <tr>
              <td style="padding:16px 32px 24px;border-top:1px solid #EBEBEB;font-family:monospace;font-size:10px;color:#A3A3A3;text-transform:uppercase;letter-spacing:0.15em;">
                Questions? Reply to this email.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`
}

/** Minimal HTML escape — email bodies interpolate user-generated strings. */
export function escape(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

/** `1234500` paise → `₹12,345` display. */
export function formatInr(paise: number): string {
  return `₹${Math.round(paise / 100).toLocaleString('en-IN')}`
}
