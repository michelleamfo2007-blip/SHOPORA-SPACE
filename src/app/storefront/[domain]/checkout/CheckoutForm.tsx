"use client"

import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useCart } from "@/lib/cart"
import { processCheckoutAction } from "@/server/actions/checkout"

const COUNTRIES = [
  "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina", "Armenia", "Australia", "Austria",
  "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan", "Bolivia",
  "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi", "Cabo Verde", "Cambodia",
  "Cameroon", "Canada", "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros", "Congo", "Costa Rica",
  "Croatia", "Cuba", "Cyprus", "Czechia", "Denmark", "Djibouti", "Dominica", "Dominican Republic", "Ecuador", "Egypt",
  "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini", "Ethiopia", "Fiji", "Finland", "France", "Gabon",
  "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana", "Haiti",
  "Honduras", "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel", "Italy", "Jamaica", "Japan",
  "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Kuwait", "Kyrgyzstan", "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia",
  "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta",
  "Marshall Islands", "Mauritania", "Mauritius", "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro",
  "Morocco", "Mozambique", "Myanmar", "Namibia", "Nauru", "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger",
  "Nigeria", "North Korea", "North Macedonia", "Norway", "Oman", "Pakistan", "Palau", "Palestine State", "Panama",
  "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal", "Qatar", "Romania", "Russia", "Rwanda",
  "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines", "Samoa", "San Marino", "Sao Tome and Principe",
  "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands",
  "Somalia", "South Africa", "South Korea", "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland",
  "Syria", "Tajikistan", "Tanzania", "Thailand", "Timor-Leste", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey",
  "Turkmenistan", "Tuvalu", "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States of America",
  "Uruguay", "Uzbekistan", "Vanuatu", "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe",
]

const inputClass =
  "h-12 w-full border border-stone-300 bg-white px-4 text-sm text-stone-900 transition-colors placeholder:text-stone-400 focus:border-stone-900 focus:outline-none"

function Field({ id, label, children }: { id: string; label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-2">
      <label htmlFor={id} className="text-[11px] uppercase tracking-[0.18em] text-stone-500">{label}</label>
      {children}
    </div>
  )
}

function money(currency: string, amount: number) {
  return `${currency} ${amount.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export function CheckoutForm({
  storeId,
  currency,
  paymentSetting,
  deliveryPolicy,
  basePath,
}: {
  storeId: string
  currency: string
  paymentSetting: any
  deliveryPolicy?: string | null
  basePath: string
}) {
  const { items, getTotalPrice, clearCart } = useCart()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (items.length === 0) {
    return (
      <div className="border border-dashed border-stone-300 px-6 py-20 text-center">
        <p className="font-display text-3xl">Your bag is empty</p>
        <Link
          href={`${basePath}/products`}
          className="mt-6 inline-flex h-12 items-center rounded-full bg-[var(--store-accent)] px-8 text-sm tracking-wide text-white hover:opacity-90"
        >
          Continue shopping
        </Link>
      </div>
    )
  }

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true)
    setError(null)
    try {
      formData.append("storeId", storeId)
      formData.append("cartData", JSON.stringify(items))

      const result = await processCheckoutAction(formData)
      if ("error" in result) {
        setError(result.error ?? "Checkout failed. Please try again.")
        return
      }

      clearCart()
      router.push(`${basePath}/checkout/success?orderId=${encodeURIComponent(result.orderNumber)}`)
    } catch (err) {
      console.error(err)
      setError("Checkout failed. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const total = getTotalPrice()

  return (
    <div className="grid gap-12 lg:grid-cols-[1.2fr_1fr] lg:gap-16">
      <form action={handleSubmit} className="order-2 grid gap-10 lg:order-1">
        <section className="grid gap-5">
          <h2 className="font-display text-3xl">Contact</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="email" label="Email">
              <input id="email" name="email" type="email" required className={inputClass} />
            </Field>
            <Field id="phone" label="Phone number">
              <input id="phone" name="phone" type="tel" required className={inputClass} />
            </Field>
          </div>
        </section>

        <section className="grid gap-5">
          <h2 className="font-display text-3xl">Delivery</h2>
          {deliveryPolicy && (
            <p className="border-l-2 border-[var(--store-accent)] bg-[#f3efe8] px-4 py-3 text-sm leading-relaxed text-stone-700">
              {deliveryPolicy}
            </p>
          )}
          <div className="grid grid-cols-2 gap-4">
            <Field id="firstName" label="First name">
              <input id="firstName" name="firstName" required className={inputClass} />
            </Field>
            <Field id="lastName" label="Last name">
              <input id="lastName" name="lastName" required className={inputClass} />
            </Field>
          </div>
          <Field id="exactLocation" label="Exact location">
            <input id="exactLocation" name="exactLocation" required placeholder="Area, street, landmark" className={inputClass} />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field id="city" label="City">
              <input id="city" name="city" required className={inputClass} />
            </Field>
            <Field id="country" label="Country">
              <select id="country" name="country" required defaultValue="Ghana" className={`${inputClass} cursor-pointer`}>
                {COUNTRIES.map((country) => (
                  <option key={country} value={country}>{country}</option>
                ))}
              </select>
            </Field>
          </div>
        </section>

        <section className="grid gap-5">
          <h2 className="font-display text-3xl">Payment</h2>
          <p className="text-sm leading-relaxed text-stone-600">
            Send the total using the payment details on this page, then enter your transaction ID or reference below.
          </p>
          <Field id="paymentReference" label="Transaction ID or reference">
            <input id="paymentReference" name="paymentReference" required placeholder="e.g. 0541234567 or TXN-999" className={inputClass} />
          </Field>
        </section>

        {error && (
          <p role="alert" className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="h-13 w-full rounded-full bg-[var(--store-accent)] text-sm tracking-wide text-white transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {isSubmitting ? "Placing your order..." : `Place order · ${money(currency, total)}`}
        </button>
      </form>

      <aside className="order-1 lg:order-2">
        <div className="grid gap-6 lg:sticky lg:top-28">
          <div className="bg-[#f3efe8] p-6 md:p-8">
            <h2 className="mb-6 text-[11px] uppercase tracking-[0.2em] text-stone-500">Order summary</h2>
            <ul className="divide-y divide-stone-300/60">
              {items.map((item) => (
                <li key={item.variantId} className="flex items-center gap-4 py-4 first:pt-0">
                  <div className="relative h-20 w-16 shrink-0 overflow-hidden bg-[#efebe4]">
                    {item.imageUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.imageUrl} alt="" className="h-full w-full object-cover" />
                    )}
                    <span className="absolute -right-0 -top-0 flex h-5 min-w-5 items-center justify-center bg-stone-900 px-1 text-[10px] text-white">
                      {item.quantity}
                    </span>
                  </div>
                  <span className="min-w-0 flex-1 text-sm text-stone-800">{item.name}</span>
                  <span className="text-sm text-stone-900">{money(currency, item.price * item.quantity)}</span>
                </li>
              ))}
            </ul>
            <div className="mt-6 flex items-baseline justify-between border-t border-stone-300/60 pt-6">
              <span className="text-sm text-stone-600">Total</span>
              <span className="font-display text-3xl">{money(currency, total)}</span>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-stone-500">
              Delivery is not included. You pay the rider when your order arrives.
            </p>
          </div>

          <div className="border border-stone-300 p-6 md:p-8">
            <h2 className="text-[11px] uppercase tracking-[0.2em] text-stone-500">How to pay</h2>
            <p className="mt-3 text-sm text-stone-700">
              Send exactly <strong className="font-medium text-stone-900">{money(currency, total)}</strong> to:
            </p>
            {!paymentSetting ? (
              <p className="mt-4 text-sm text-red-700">This store has not added its payment details yet. Please contact the store before paying.</p>
            ) : (
              <div className="mt-5 grid gap-5">
                {paymentSetting.mobileMoneyNumber && (
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.18em] text-stone-500">Mobile Money</p>
                    <p className="mt-1 text-xl tracking-wide text-stone-900">{paymentSetting.mobileMoneyNumber}</p>
                    {paymentSetting.accountName && <p className="text-sm text-stone-600">{paymentSetting.accountName}</p>}
                  </div>
                )}
                {paymentSetting.bankName && (
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.18em] text-stone-500">Bank transfer</p>
                    <p className="mt-1 text-sm text-stone-700">{paymentSetting.bankName}</p>
                    <p className="text-xl tracking-wide text-stone-900">{paymentSetting.accountNumber}</p>
                    <p className="text-sm text-stone-600">{paymentSetting.accountName}</p>
                  </div>
                )}
                {paymentSetting.instructions && (
                  <p className="border-t border-stone-200 pt-4 text-sm leading-relaxed text-stone-600">{paymentSetting.instructions}</p>
                )}
              </div>
            )}
          </div>
        </div>
      </aside>
    </div>
  )
}
