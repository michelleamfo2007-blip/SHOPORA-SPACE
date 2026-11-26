import { resend } from "@/lib/resend"

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}

export async function sendBlackFridayGrantEmail(opts: {
  to: string
  ownerName: string | null
  storeName: string
  storeId: string
}) {
  const first = opts.ownerName?.split(" ")[0] || opts.to.split("@")[0]
  const dashboardUrl = `https://www.shopora.space/${opts.storeId}/black-friday`

  const { error } = await resend.emails.send({
    from: "Michelle from Shopora <customersupport@shopora.space>",
    to: opts.to,
    subject: `Black Friday is open for ${opts.storeName}`,
    html: `
      <p>Hi ${escapeHtml(first)},</p>
      <p>Shopora has opened <strong>Black Friday</strong> for <strong>${escapeHtml(opts.storeName)}</strong>.</p>
      <p>You can now set a sale price on each item and turn the sale on when you are ready. Your regular prices stay as they are. Shoppers only see the sale prices while it is on.</p>
      <p>Open Black Friday in your dashboard:<br><a href="${dashboardUrl}">${dashboardUrl}</a></p>
      <p>If you need a hand, reply to this email or text me on WhatsApp at <strong>0537858896</strong>.</p>
      <p>Best,<br>Michelle from Shopora</p>
    `,
  })

  if (error) throw new Error(error.message)
}
