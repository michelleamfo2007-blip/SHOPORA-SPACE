import { LegalPage } from "@/components/marketing/LegalPage"
import { DeleteAccountForm } from "./DeleteAccountForm"

export const metadata = { title: "Delete your account · Shopora" }

export default function DeleteAccountPage() {
  return (
    <LegalPage
      title="Delete your account"
      updated="9 November 2026"
      intro={
        <div className="space-y-4">
          <p>
            You can ask Shopora to delete your seller, rider or customer account and the personal information linked to it.
            You can also do this in the Shopora app: <strong>More, then Delete my account</strong> (riders: on the Jobs screen).
          </p>
          <p>
            <strong>What we delete:</strong> your login, name, email, phone number, payment details, and for sellers your
            store, products and photos. <strong>What we may keep:</strong> records of past orders that the law requires us to
            keep, with your personal details removed where possible.
          </p>
          <p>We confirm by email and complete the deletion within 30 days.</p>
        </div>
      }
    >
      <div className="py-8">
        <DeleteAccountForm />
      </div>
    </LegalPage>
  )
}
