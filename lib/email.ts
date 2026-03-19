import { Resend } from 'resend'

function escapeHtml(str: string | null | undefined): string {
  if (!str) return '—'
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function getResend() {
  return new Resend(process.env.RESEND_API_KEY)
}

export async function sendContactConfirmation(to: string, name: string) {
  const resend = getResend()
  await resend.emails.send({
    from: 'Xyren.me <hello@xyren.me>',
    to,
    subject: "We received your message — we'll be in touch soon",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2>Hi ${escapeHtml(name)},</h2>
        <p>Thanks for reaching out! We've received your message and will get back to you within 1 business day.</p>
        <p>In the meantime, feel free to explore our <a href="https://xyren.me/resources/blog">blog</a> for tips on growing your service business online.</p>
        <br/>
        <p>— The Xyren.me Team</p>
      </div>
    `,
  })
}

export async function sendContactNotification(submission: {
  name: string
  email: string
  phone?: string | null
  business?: string | null
  service?: string | null
  message: string
}) {
  const resend = getResend()
  const contact = process.env.CONTACT_EMAIL ?? 'hello@xyren.me'
  await resend.emails.send({
    from: 'Xyren.me <hello@xyren.me>',
    to: contact,
    subject: `New contact from ${submission.business || submission.name}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2>New Contact Submission</h2>
        <table style="width:100%; border-collapse: collapse;">
          <tr><td style="padding:6px 0"><strong>Name</strong></td><td>${escapeHtml(submission.name)}</td></tr>
          <tr><td style="padding:6px 0"><strong>Email</strong></td><td>${escapeHtml(submission.email)}</td></tr>
          <tr><td style="padding:6px 0"><strong>Phone</strong></td><td>${escapeHtml(submission.phone)}</td></tr>
          <tr><td style="padding:6px 0"><strong>Business</strong></td><td>${escapeHtml(submission.business)}</td></tr>
          <tr><td style="padding:6px 0"><strong>Service</strong></td><td>${escapeHtml(submission.service)}</td></tr>
        </table>
        <h3>Message</h3>
        <p style="white-space: pre-wrap;">${escapeHtml(submission.message)}</p>
      </div>
    `,
  })
}
