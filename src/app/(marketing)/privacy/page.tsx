import { DropdownSection } from "@/components/DropdownSection"
import { LegalPage } from "@/components/marketing/LegalPage"

export default function PrivacyPolicyPage() {
  return (
    <LegalPage title="Privacy Policy">
      <DropdownSection title="1. Information we collect">
        We collect information you provide directly to us, such as when you create or modify your account, request
        on-demand services, contact customer support, or otherwise communicate with us.
      </DropdownSection>
      <DropdownSection title="2. Use of information">
        We may use the information we collect about you to provide, maintain, and improve our services, such as to
        facilitate payments, send receipts, and provide products and services you request.
      </DropdownSection>
      <DropdownSection title="3. Sharing of information">
        We do not share personal information with companies, organizations, and individuals outside of Shopora unless
        one of the following circumstances applies: with your consent, for legal reasons, or with domain
        administrators.
      </DropdownSection>
      <DropdownSection title="4. Cookies">
        We use cookies and similar tracking technologies to track the activity on our service and hold certain
        information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.
      </DropdownSection>
    </LegalPage>
  )
}
