import Link from "next/link"
import { DropdownSection } from "@/components/DropdownSection"
import { LegalPage } from "@/components/marketing/LegalPage"

export const metadata = { title: "Privacy Policy · Shopora" }

export default function PrivacyPolicyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      updated="9 November 2026"
      intro={
        <p>
          This policy explains what information Shopora Space (&ldquo;Shopora&rdquo;, &ldquo;we&rdquo;) collects through
          shopora.space, the stores built on it, and the Shopora app for iPhone and Android, and how we use it. Shopora is
          run from Accra, Ghana. Questions: <a className="underline" href="mailto:shoporaspace@gmail.com">shoporaspace@gmail.com</a>.
        </p>
      }
    >
      <DropdownSection title="1. Information we collect">
        {`Sellers: your name, email address and password (stored encrypted), your store details (name, web address, logo, photos, description, contact links), the Mobile Money and bank details you add so customers can pay you, your products and their photos, your orders and customers, and the email addresses of teammates you invite.

Customers who order from a store: your name, email, phone number, delivery address, the map pin you choose for delivery (if you share it), the payment reference you enter, and what you ordered. If you write a review, we keep your name and review.

Riders: your name, phone number, email, Mobile Money number, the jobs you accept and your delivery history and ratings.

From the app: a notification token so we can send order and job alerts, and photos you choose to take or upload for products. The app only uses your camera and photo library when you tap to add a photo, and never records audio.

From the website: basic, anonymous page-view statistics and a cookie that keeps you logged in.`}
      </DropdownSection>
      <DropdownSection title="2. How we use it">
        {`To run your store and process orders, show customers how to pay the seller, arrange Shopora Delivery in Accra, send order, payment and delivery emails and app notifications, provide support, keep accounts secure and prevent fraud, and improve Shopora. We do not sell your personal information and we do not use it for advertising.`}
      </DropdownSection>
      <DropdownSection title="3. Who we share it with">
        {`The store you order from: your order, contact and delivery details, so they can fulfil it.

Shopora riders: for Shopora Delivery orders, the pickup address, your name, phone number, delivery address and map pin, so the rider can deliver to you.

Service providers who help us run Shopora, only for that purpose: Vercel (website hosting and anonymous analytics), Supabase (database and photo storage), Resend (email), Expo (app notifications), and OpenStreetMap-based services (looking up addresses and delivery routes).

Payments are made directly from customers to sellers by Mobile Money or bank transfer. Shopora does not handle or store card details.

We may also share information if the law requires it, or to protect the safety of our users.`}
      </DropdownSection>
      <DropdownSection title="4. How long we keep it">
        {`We keep account and store information while your account is open. Order records are kept for as long as the seller's store needs them for its own records, and for legal and tax purposes. When an account is deleted, we remove or anonymise its personal information within 30 days, except where we must keep records by law.`}
      </DropdownSection>
      <DropdownSection title="5. Your choices">
        {`You can view and update your store and account details at any time in your dashboard or the app. You can turn off app notifications in your phone's settings, and decline non-essential cookies on the website.`}
      </DropdownSection>
      <DropdownSection title="6. Deleting your account">
        <>
          You can ask us to delete your account at any time: in the app (More, then Delete my account; riders: on the Jobs
          screen), or on our{" "}
          <Link href="/delete-account" className="underline">
            account deletion page
          </Link>
          . We confirm by email and complete the deletion within 30 days.
        </>
      </DropdownSection>
      <DropdownSection title="7. Security">
        {`Passwords are stored encrypted, connections use HTTPS, and access to store data is limited to the store's own team. No system is perfectly secure, so please use a strong password and keep it private.`}
      </DropdownSection>
      <DropdownSection title="8. Children">
        {`Shopora is not meant for children under 13, and we do not knowingly collect their information.`}
      </DropdownSection>
      <DropdownSection title="9. Changes and contact">
        {`If we change this policy we will update the date at the top. For any privacy question or request, email shoporaspace@gmail.com.`}
      </DropdownSection>
    </LegalPage>
  )
}
