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
        subject: "Big News: Shopora Space Prices Just Dropped! 🎉",
        html: `
          <p>Hi there,</p>
          <p>We have some exciting news!</p>
          <p>We've officially lowered the monthly subscription rates across all Shopora Space packages to make it even easier to start and grow your online business.</p>
          <ul>
            <li><strong>Starter Package:</strong> Now GH₵100 / month</li>
            <li><strong>Professional Package:</strong> Now GH₵200 / month</li>
            <li><strong>Business Package:</strong> Now GH₵300 / month</li>
          </ul>
          <p>If you've been waiting to create your store, now is the perfect time. You'll still get a full 7-day free trial before you're charged.</p>
          <p>If you need any help setting up your store, you can reply directly to this email or text me on WhatsApp at <strong>0537858896</strong>.</p>
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
  
  console.log("Finished sending announcements.");
}

main().catch(console.error);
