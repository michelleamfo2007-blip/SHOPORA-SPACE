import { Resend } from "resend";
import dotenv from "dotenv";
dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

async function main() {
  const { db } = await import("./src/lib/db");
  console.log("Fetching up to 15 oldest subscriptions...");
  const subscriptions = await db.subscription.findMany({
    orderBy: {
      createdAt: "asc"
    },
    take: 15,
    include: {
      store: {
        include: {
          members: {
            include: {
              user: true
            }
          }
        }
      }
    }
  });

  console.log("Found " + subscriptions.length + " early bird subscriptions.");

  for (const sub of subscriptions) {
    if (!sub.isEarlyBird) {
      await db.subscription.update({
        where: { id: sub.id },
        data: { isEarlyBird: true }
      });
      console.log("Updated subscription for store " + sub.store.name + " to Early Bird.");

      for (const member of sub.store.members) {
        if (member.user.email) {
          try {
            const { error } = await resend.emails.send({
              from: "Michelle from Shopora <billing@shopora.space>",
              to: member.user.email,
              subject: "You're one of the first 15 Shopora vendors! 🎉",
              html: `
                <p>Hi ${member.user.name || "Vendor"},</p>
                <p>You’re one of the first 15 Shopora vendors!</p>
                <p>You’ve secured our Early Bird offer: instead of GH₵150/month, you’ll pay just <strong>GH₵100/month for your first 2 paid months.</strong></p>
                <p>Your current free trial remains unchanged. Once your trial ends, your first 2 paid months will be charged at GH₵100/month. After that, your subscription returns to the regular GH₵150/month.</p>
                <p>Welcome to Shopora Space!</p>
              `,
            });
            if (error) {
              console.error("Failed to send email to " + member.user.email, error);
            } else {
              console.log("Successfully sent Early Bird confirmation to " + member.user.email);
            }
          } catch (e) {
             console.error("Error sending to " + member.user.email, e);
          }
        }
      }
    } else {
      console.log("Store " + sub.store.name + " is already Early Bird.");
    }
  }

  console.log("Finished applying early bird offers.");
  process.exit(0);
}

main();
