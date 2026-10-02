import { Resend } from "resend";
import dotenv from "dotenv";
dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

async function main() {
  const { db } = await import("./src/lib/db");
  console.log("Fetching approved waitlist users...");
  const approvedUsers = await db.waitlistEntry.findMany({
    where: {
      status: "INVITED"
    }
  });

  console.log("Found " + approvedUsers.length + " approved users.");

  for (const user of approvedUsers) {
    console.log("Sending email to " + user.email);
    try {
      const { error } = await resend.emails.send({
        from: "Michelle from Shopora <customersupport@shopora.space>",
        to: user.email,
        subject: "Need help creating your Shopora store?",
        html: `
          <p>Hi there,</p>
          <p>Congratulations on being approved to join Shopora Space!</p>
          <p>If you need any help setting up your store or have any questions during the onboarding process, please don't hesitate to reach out.</p>
          <p>You can reply directly to this email, or text me on WhatsApp at <strong>0537858896</strong>.</p>
          <p>I'm here to ensure you have a smooth launch!</p>
          <p>Best,<br>Michelle from Shopora</p>
        `,
      });
      if (error) {
        console.error("Failed to send to " + user.email, error);
      } else {
        console.log("Successfully sent to " + user.email);
      }
    } catch (e) {
      console.error("Error sending to " + user.email, e);
    }
  }

  console.log("Finished sending emails.");
  process.exit(0);
}

main();
