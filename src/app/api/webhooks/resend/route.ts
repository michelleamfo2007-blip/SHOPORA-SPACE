import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { db } from '@/lib/db'; // assuming this is your db export

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const payload = await req.json();

    console.log("Received webhook payload:", payload);

    // Verify it's an email received event
    if (payload.type === 'email.received') {
      const emailId = payload.data.id;
      
      console.log(`Fetching full email content for ID: ${emailId}`);
      
      const { data: emailData, error } = await resend.emails.get(emailId);
      
      if (error || !emailData) {
        console.error("Failed to fetch email details:", error);
        return NextResponse.json({ error: 'Failed to fetch email details' }, { status: 500 });
      }

      console.log("Full email data retrieved");

      // Clean up from and to addresses (they often look like "Name <email@example.com>")
      const extractEmail = (str: string) => {
        const match = str.match(/<([^>]+)>/);
        return match ? match[1].toLowerCase() : str.toLowerCase();
      };

      const fromEmail = extractEmail(emailData.from || '');
      const toEmails = (emailData.to || []).map(extractEmail);
      const subject = emailData.subject || "No Subject";
      const textContent = emailData.text || emailData.html || "No Content";

      if (!fromEmail || toEmails.length === 0) {
        console.error("Missing from/to email addresses");
        return NextResponse.json({ error: 'Missing email addresses' }, { status: 400 });
      }

      // Step 1: Find the Store this email was sent to.
      // We'll check if the 'to' email matches a store's contactEmail, 
      // or if you're using something like store-slug@resend.app, we match the slug.
      let targetStore = null;

      for (const toEmail of toEmails) {
        // Try to find a store by contactEmail
        targetStore = await db.store.findFirst({
          where: { contactEmail: toEmail }
        });

        // If not found by contactEmail, try to extract slug from the prefix 
        // e.g. mystore@onteoalkoi.resend.app -> 'mystore'
        if (!targetStore) {
          const emailPrefix = toEmail.split('@')[0];
          targetStore = await db.store.findUnique({
            where: { slug: emailPrefix }
          });
        }

        if (targetStore) break; // Found our store
      }

      if (!targetStore) {
        console.error("No matching store found for receiving emails:", toEmails);
        // You might want to handle this gracefully instead of failing, 
        // perhaps logging to a central 'unassigned tickets' table.
        return NextResponse.json({ error: 'Store not found for this email address' }, { status: 404 });
      }

      // Step 2: Find or Create the Customer based on the sender's email
      let customer = await db.customer.findFirst({
        where: {
          storeId: targetStore.id,
          email: fromEmail
        }
      });

      if (!customer) {
        // Create a new customer if they don't exist
        const fromName = emailData.from?.split('<')[0]?.trim() || "Unknown";
        customer = await db.customer.create({
          data: {
            storeId: targetStore.id,
            email: fromEmail,
            name: fromName,
          }
        });
        console.log(`Created new customer: ${customer.id}`);
      }

      // Step 3: Create the Support Ticket
      const ticket = await db.supportTicket.create({
        data: {
          storeId: targetStore.id,
          customerId: customer.id,
          subject: subject,
          message: textContent,
          status: "OPEN"
        }
      });

      console.log(`Successfully created support ticket ${ticket.id} for store ${targetStore.slug}`);
    }

    return NextResponse.json({ message: 'Webhook processed successfully' }, { status: 200 });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
