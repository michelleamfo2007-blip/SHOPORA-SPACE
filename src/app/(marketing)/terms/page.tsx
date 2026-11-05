import { DropdownSection } from "@/components/DropdownSection"
import { LegalPage } from "@/components/marketing/LegalPage"

export default function TermsOfServicePage() {
  return (
    <LegalPage title="Terms of Service">
      <DropdownSection title="1. Acceptance of terms">
        By accessing or using the Shopora platform, you agree to be bound by these terms. If you disagree with any part
        of the terms, you may not access the service.
      </DropdownSection>
      <DropdownSection title="2. Description of service">
        Shopora provides an e-commerce platform that enables merchants to build storefronts and sell products or
        services online.
      </DropdownSection>
      <DropdownSection title="3. User accounts">
        When you create an account with us, you must provide information that is accurate, complete, and current at
        all times. Failure to do so constitutes a breach of the terms.
      </DropdownSection>
      <DropdownSection title="4. Merchant responsibilities">
        You are responsible for all activity that occurs under your account. You must not transmit any worms or
        viruses or any code of a destructive nature. You are responsible for the goods and services you sell.
      </DropdownSection>
    </LegalPage>
  )
}
