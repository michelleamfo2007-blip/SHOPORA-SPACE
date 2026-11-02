import { SHOPORA_DELIVERY_CONFIG } from "@/lib/shopora-delivery"

/** Bump when rider terms change so existing riders can be asked to re-accept later. */
export const RIDER_TERMS_VERSION = "2026-11-01"

export const RIDER_PLATFORM_CUT_PERCENT = Math.round(SHOPORA_DELIVERY_CONFIG.platformCutRate * 100)

export type RiderTermsSection = {
  heading: string
  paragraphs?: string[]
  bullets?: string[]
  numbered?: string[]
  note?: string
}

export const RIDER_TERMS = {
  brand: "SHOPORA SPACE",
  title: "Delivery Rider Terms and Conditions",
  version: RIDER_TERMS_VERSION,
  effectiveDate: "1 November 2026",
  website: "https://shopora.space",
  supportEmail: "shoporaspace@gmail.com",
  cutPercent: RIDER_PLATFORM_CUT_PERCENT,
  riderPercent: 100 - RIDER_PLATFORM_CUT_PERCENT,
  sections: [
    {
      heading: "1. Introduction",
      paragraphs: [
        "Welcome to Shopora Space Delivery Services.",
        "These Terms and Conditions govern the registration, participation and use of the Shopora Space delivery platform by delivery riders.",
        "Shopora Space provides an e-commerce marketplace that connects customers, vendors and independent delivery riders to facilitate the delivery of purchased products.",
        "By registering as a delivery rider, accessing the rider dashboard or accepting delivery requests through Shopora Space, you acknowledge that you have read, understood and agreed to comply with these Terms and Conditions.",
      ],
    },
    {
      heading: "2. Rider Eligibility and Registration",
      paragraphs: ["To become a registered delivery rider on Shopora Space, applicants must:"],
      numbered: [
        "Be at least 18 years old.",
        "Provide accurate personal information.",
        "Provide a valid Ghana Card or other legally accepted identification.",
        "Provide an active and verifiable telephone number.",
        "Submit a recent profile photograph.",
        "Provide accurate vehicle or motorcycle information, where applicable.",
        "Possess a valid driving licence where required by law.",
        "Have the legally required vehicle registration, roadworthiness certification and insurance.",
        "Provide any additional documentation reasonably required by Shopora.",
      ],
      note: "Shopora reserves the right to verify submitted information and approve, reject, suspend or deactivate rider accounts. Only approved riders may receive and accept delivery requests.",
    },
    {
      heading: "3. Rider Account Responsibilities",
      paragraphs: ["Every rider is responsible for maintaining the security of their account. Riders must:"],
      bullets: [
        "Keep their login credentials confidential.",
        "Never share their accounts with another person.",
        "Ensure their profile information remains accurate.",
        "Update Shopora when their contact or vehicle information changes.",
        "Use the platform exclusively for legitimate delivery activities.",
      ],
      note: "Riders must not impersonate other individuals, operate multiple accounts to manipulate delivery assignments or allow unauthorised persons to use their accounts.",
    },
    {
      heading: "4. Delivery Requests and Acceptance",
      paragraphs: [
        "Shopora Space operates a delivery dispatch system through which available riders may receive delivery requests.",
        "When a delivery request becomes available:",
      ],
      numbered: [
        "Eligible and available riders may receive a notification.",
        "Riders may review the delivery information provided.",
        "A rider may accept or decline the delivery request.",
        "The first eligible rider whose acceptance is successfully confirmed by the platform receives the assignment.",
        "Once assigned, the rider becomes responsible for completing the delivery.",
      ],
      note: "A delivery is not considered assigned until the Shopora system confirms successful acceptance. Riders must not attempt to claim, manipulate or interfere with delivery assignments belonging to other riders.",
    },
    {
      heading: "5. Delivery Fees and Shopora Commission",
      paragraphs: [
        "Shopora Space operates a commission-based delivery arrangement.",
        "For every successfully completed delivery, the delivery fee is distributed as follows:",
      ],
      bullets: [
        `Shopora Space: ${RIDER_PLATFORM_CUT_PERCENT}%`,
        `Delivery Rider: ${100 - RIDER_PLATFORM_CUT_PERCENT}%`,
      ],
      note: `For example: if the customer pays GH₵30 as the delivery fee, Shopora Space receives GH₵${((30 * RIDER_PLATFORM_CUT_PERCENT) / 100).toFixed(2)} and the delivery rider receives GH₵${(30 - (30 * RIDER_PLATFORM_CUT_PERCENT) / 100).toFixed(2)}. The commission is calculated exclusively on the delivery fee and not on the value of the products purchased by the customer. Shopora reserves the right to review and modify its commission structure, provided riders are appropriately notified before the revised rates take effect. Riders must not independently increase delivery fees, demand additional unauthorised payments or collect charges outside the platform’s approved pricing structure.`,
    },
    {
      heading: "6. Rider Earnings and Payments",
      paragraphs: [
        "Rider earnings are calculated based on successfully completed deliveries and the applicable commission structure.",
        "Riders may access their earnings information through the rider dashboard, including:",
      ],
      bullets: [
        "Total delivery earnings.",
        "Individual delivery earnings.",
        "Completed delivery transactions.",
        "Pending earnings.",
        "Payment history.",
      ],
      note: "Payments shall be processed through the payment methods and settlement arrangements communicated by Shopora. Riders are responsible for providing accurate payment information. Shopora may investigate disputed transactions, suspected fraudulent activities or payment irregularities before releasing affected funds.",
    },
    {
      heading: "7. Delivery Responsibilities",
      paragraphs: ["Once a rider accepts a delivery, they must:"],
      numbered: [
        "Proceed to the designated vendor or collection location.",
        "Collect the correct order.",
        "Handle all products carefully.",
        "Maintain the condition of the items during transportation.",
        "Deliver the order to the correct customer and destination.",
        "Follow the delivery instructions provided.",
        "Update delivery statuses accurately.",
        "Complete the delivery confirmation process.",
      ],
      note: "Riders must not intentionally delay deliveries, abandon accepted assignments or deliver orders to unauthorised individuals.",
    },
    {
      heading: "8. Delivery Confirmation and OTP Verification",
      paragraphs: [
        "Shopora may implement a One-Time Password (OTP) or another verification method to confirm successful deliveries.",
        "Where OTP verification is required:",
      ],
      bullets: [
        "The customer will receive a delivery confirmation code.",
        "The rider must request the code from the customer at the point of delivery.",
        "The rider must enter the correct code into the platform.",
        "The delivery will only be marked as completed after successful verification.",
      ],
      note: "Riders must not falsify delivery confirmations, reuse OTPs or mark undelivered orders as completed.",
    },
    {
      heading: "9. Customer Conduct and Professionalism",
      paragraphs: [
        "Riders are expected to maintain professional conduct when interacting with customers and vendors.",
        "Riders must:",
      ],
      bullets: [
        "Treat customers and vendors respectfully.",
        "Communicate politely.",
        "Avoid harassment, discrimination, threats or abusive language.",
        "Respect customers’ privacy.",
        "Avoid inappropriate personal contact.",
        "Never request personal favours or unauthorised payments.",
        "Never use customer information for personal or commercial purposes outside the delivery assignment.",
      ],
      note: "Any form of harassment, intimidation, theft, fraud or misconduct may result in immediate suspension or permanent removal from the platform.",
    },
    {
      heading: "10. Failed and Unsuccessful Deliveries",
      paragraphs: [
        "Where a delivery cannot be completed, the rider must report the issue through the Shopora platform.",
        "Acceptable reasons may include:",
      ],
      bullets: [
        "Customer unavailable.",
        "Incorrect delivery address.",
        "Customer unreachable.",
        "Customer refuses the order.",
        "Vehicle breakdown or emergency.",
        "Other legitimate delivery complications.",
      ],
      note: "Riders must provide accurate information and additional explanations where necessary. Shopora reserves the right to investigate failed deliveries and determine whether an assignment should be cancelled, reassigned or otherwise resolved. Riders must not independently dispose of, retain or transfer customer orders without authorisation.",
    },
    {
      heading: "11. Cancellations and Reassignments",
      paragraphs: ["Shopora may cancel or reassign a delivery where:"],
      bullets: [
        "A rider fails to collect an order within the permitted timeframe.",
        "A rider becomes unavailable.",
        "A delivery cannot reasonably be completed.",
        "Fraudulent activity is suspected.",
        "The customer or vendor cancels the underlying order.",
        "The platform determines that reassignment is necessary.",
      ],
      note: "Riders must promptly notify Shopora of circumstances that may prevent them from completing an accepted delivery. Repeated unjustified cancellations or abandonment of accepted deliveries may result in account restrictions.",
    },
    {
      heading: "12. Prohibited Activities",
      paragraphs: ["Riders must not:"],
      bullets: [
        "Steal, damage or intentionally tamper with customer orders.",
        "Falsify delivery records.",
        "Manipulate delivery fees or earnings.",
        "Accept deliveries using another person’s account.",
        "Share customer information with unauthorised parties.",
        "Attempt to bypass the platform’s delivery assignment system.",
        "Collect unauthorised delivery charges.",
        "Engage in fraudulent activities.",
        "Use Shopora to facilitate illegal transactions.",
        "Misrepresent their identity or qualifications.",
      ],
      note: "Shopora reserves the right to investigate and take appropriate action against any rider suspected of violating these requirements.",
    },
    {
      heading: "13. Safety and Legal Compliance",
      paragraphs: [
        "Riders are responsible for complying with all applicable laws and road safety requirements in Ghana.",
        "Riders must:",
      ],
      bullets: [
        "Observe traffic regulations.",
        "Wear appropriate protective equipment.",
        "Maintain their vehicles in safe operating condition.",
        "Carry legally required licences and insurance.",
        "Avoid reckless driving.",
        "Never operate a vehicle under the influence of alcohol or prohibited substances.",
      ],
      note: "Shopora does not authorise riders to disregard applicable road safety regulations in order to meet delivery deadlines.",
    },
    {
      heading: "14. Customer Information and Data Privacy",
      paragraphs: [
        "Riders may receive access to customer information necessary to complete assigned deliveries. Such information may include:",
      ],
      bullets: [
        "Customer names.",
        "Telephone numbers.",
        "Delivery addresses.",
        "Delivery instructions.",
      ],
      note: "Riders must: (1) use customer information exclusively for the assigned delivery; (2) never disclose customer information to unauthorised individuals; (3) never store or distribute customer information unnecessarily; (4) never use customer details for marketing or personal communication; and (5) delete or cease using customer information when it is no longer required for the delivery. Riders must comply with applicable data protection requirements, including Ghana’s Data Protection Act, 2012 (Act 843).",
    },
    {
      heading: "15. Loss, Damage and Customer Complaints",
      paragraphs: [
        "Riders are expected to exercise reasonable care when handling customer orders.",
        "Where an order is lost, damaged, stolen or incorrectly delivered, the rider must immediately report the incident to Shopora.",
        "Shopora may investigate complaints and determine responsibility based on available evidence.",
        "Where a rider is found to have caused loss or damage through negligence, misconduct, fraud or intentional wrongdoing, Shopora may pursue appropriate remedies in accordance with applicable law.",
      ],
    },
    {
      heading: "16. Rider Ratings and Performance",
      paragraphs: [
        "Customers may be allowed to rate riders following completed deliveries.",
        "Shopora may consider:",
      ],
      bullets: [
        "Customer ratings.",
        "Delivery completion rates.",
        "Delivery punctuality.",
        "Customer complaints.",
        "Cancellation frequency.",
        "Compliance with platform policies.",
      ],
      note: "Consistently poor performance or repeated violations may result in warnings, temporary restrictions or account termination.",
    },
    {
      heading: "17. Account Suspension and Termination",
      paragraphs: ["Shopora reserves the right to temporarily suspend or permanently deactivate a rider account where:"],
      bullets: [
        "The rider violates these Terms and Conditions.",
        "Fraudulent activities are detected.",
        "False registration information is provided.",
        "Customer safety is compromised.",
        "The rider engages in theft or misconduct.",
        "The rider repeatedly abandons delivery assignments.",
        "The rider’s legal documentation becomes invalid or expires.",
      ],
      note: "Where reasonably possible, riders will be informed of the reason for suspension or termination. Shopora may immediately restrict access where necessary to protect customers, vendors, riders or the platform. Outstanding legitimate earnings will be reviewed and settled in accordance with applicable payment arrangements and legal requirements.",
    },
    {
      heading: "18. Platform Availability",
      paragraphs: [
        "Shopora Space aims to maintain a reliable delivery platform. However, Shopora does not guarantee uninterrupted access to the platform.",
        "Service interruptions may occur due to:",
      ],
      bullets: [
        "Technical maintenance.",
        "Network failures.",
        "Server issues.",
        "Third-party service interruptions.",
        "Circumstances beyond Shopora’s reasonable control.",
      ],
      note: "Shopora will make reasonable efforts to restore affected services.",
    },
    {
      heading: "19. Independent Rider Relationship",
      paragraphs: [
        "Unless otherwise agreed in a separate written agreement, riders participate in the Shopora delivery network as independent service providers.",
        "Registration on Shopora does not, by itself, guarantee a minimum number of delivery assignments, fixed working hours or guaranteed income.",
        "Riders may choose their availability, subject to platform requirements and applicable laws.",
        "Nothing in these Terms is intended to exclude employment rights or obligations where the actual working relationship is legally determined to constitute employment.",
      ],
    },
    {
      heading: "20. Limitation of Liability",
      paragraphs: [
        "To the extent permitted by applicable law, Shopora shall not be responsible for losses arising from circumstances beyond its reasonable control.",
        "Nothing in these Terms excludes liability that cannot legally be excluded, including liability arising from fraud, wilful misconduct or other obligations imposed by applicable law.",
        "Riders remain responsible for their own conduct, legal compliance and reasonable care when performing deliveries.",
      ],
    },
    {
      heading: "21. Changes to These Terms",
      paragraphs: [
        "Shopora reserves the right to update or modify these Terms and Conditions to reflect changes in its operations, platform features, policies or applicable laws.",
        "Riders will be notified of material changes through the platform or other appropriate communication channels.",
        "Continued participation in the delivery network after revised terms take effect constitutes acceptance of the updated terms, subject to applicable law.",
      ],
    },
    {
      heading: "22. Governing Law",
      paragraphs: [
        "These Terms and Conditions shall be governed by and interpreted in accordance with the laws of the Republic of Ghana.",
        "Any disputes arising from these Terms shall be handled through appropriate dispute resolution procedures and, where necessary, the courts of competent jurisdiction in Ghana.",
      ],
    },
    {
      heading: "23. Contact and Support",
      paragraphs: [
        "For delivery-related enquiries, complaints, payment disputes or assistance, riders may contact Shopora through the official support channels provided on the platform.",
      ],
    },
  ] satisfies RiderTermsSection[],
  acceptance: {
    title: "Rider Acceptance and Agreement",
    intro:
      "By registering as a delivery rider and accepting these Terms and Conditions electronically, I confirm that:",
    points: [
      "I have read and understood the Shopora Space Delivery Rider Terms and Conditions.",
      "I agree to comply with the delivery policies and operational requirements.",
      `I understand the ${RIDER_PLATFORM_CUT_PERCENT}% Shopora commission and ${100 - RIDER_PLATFORM_CUT_PERCENT}% rider earnings arrangement.`,
      "I agree to handle customer orders responsibly and professionally.",
      "I consent to the processing of my personal information for legitimate rider registration, verification and delivery operations, in accordance with the applicable privacy policy.",
    ],
    electronic:
      "Electronic Acceptance: By selecting “I Agree” during registration, I acknowledge my acceptance of these Terms and Conditions.",
  },
} as const
