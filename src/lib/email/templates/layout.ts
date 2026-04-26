/**
 * Shared HTML scaffold for PWMA MMS transactional emails. Keeps branding
 * and footer identical across templates. Plain-text versions are derived
 * per-template.
 */

interface LayoutOptions {
  title: string
  preheader?: string
  body: string
}

export function wrapEmailHtml({ title, preheader, body }: LayoutOptions): string {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(title)}</title>
  </head>
  <body style="margin:0;padding:0;background:#f4f5f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#1f2937;">
    ${preheader ? `<div style="display:none;max-height:0;overflow:hidden;">${escapeHtml(preheader)}</div>` : ''}
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td align="center" style="padding:24px 12px;">
          <table role="presentation" width="560" cellpadding="0" cellspacing="0" border="0" style="background:#ffffff;border-radius:8px;border:1px solid #e5e7eb;">
            <tr>
              <td style="padding:24px 32px;border-bottom:1px solid #f3f4f6;">
                <strong style="font-size:18px;color:#111827;">PWMA Membership</strong>
              </td>
            </tr>
            <tr>
              <td style="padding:32px;font-size:15px;line-height:1.6;color:#1f2937;">
                ${body}
              </td>
            </tr>
            <tr>
              <td style="padding:20px 32px;border-top:1px solid #f3f4f6;font-size:12px;color:#6b7280;">
                Private Wealth Management Association<br />
                Sent by the PWMA Membership Management System. Please do not reply.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`
}

export function escapeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}
