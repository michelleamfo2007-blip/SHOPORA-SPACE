import { Resend } from "resend";
import dotenv from "dotenv";
dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

async function main() {
  const { db } = await import("./src/lib/db");
  console.log("Fetching Early Bird subscriptions...");
  const subscriptions = await db.subscription.findMany({
    where: { isEarlyBird: true },
    include: {
      store: {
        include: {
          members: {
            include: { user: true }
          }
        }
      }
    }
  });

  console.log(`Found ${subscriptions.length} early bird subscriptions.`);

  for (const sub of subscriptions) {
    for (const member of sub.store.members) {
      if (member.user.email) {
        try {
          const { error } = await resend.emails.send({
            from: "Michelle from Shopora <billing@shopora.space>",
            to: member.user.email,
            subject: "Great News: Your Early Bird price just dropped! 🎉",
            html: `
              <p>Hi ${member.user.name || "Vendor"},</p>
              <p>I have some fantastic news for you!</p>
              <p>We just made Shopora Space even more affordable for our early adopters. The email we sent you yesterday said your Early Bird price would be GH₵100/month.</p>
              <p><strong>We have officially dropped it down to just GH₵50/month for your first 2 paid months!</strong> (And our regular rate has dropped to GH₵100/mo).</p>
              <p>Your current free trial still remains completely unchanged. Once your trial ends, you will only be charged GH₵50/month for your first two months.</p>
              <p>Thank you for being one of our first 15 vendors!</p>
              <br/>
              <p>Best,<br/>Michelle<br/>Founder, Shopora Space</p>
            `,
          });
          if (error) {
            console.error("Failed to send email to " + member.user.email, error);
          } else {
            console.log("Successfully sent Price Drop confirmation to " + member.user.email);
          }
        } catch (e) {
            console.error("Error sending to " + member.user.email, e);
        }
      }
    }
  }
  console.log("Finished sending price drop emails.");
}

main().catch(console.error);
