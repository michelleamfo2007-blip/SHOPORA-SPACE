"use client"

import Link from "next/link"
import { useEffect, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { useCart } from "@/lib/cart"
import { processCheckoutAction } from "@/server/actions/checkout"
import { quoteShoporaDeliveryAction } from "@/server/actions/shopora-delivery"
import { PlaceAutocomplete } from "@/components/storefront/PlaceAutocomplete"

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

/** Saved on this device after a successful order so repeat customers don't retype everything. */
const SAVED_DETAILS_KEY = "shopora_checkout_details"
type SavedDetails = {
  email: string
  phone: string
  firstName: string
  lastName: string
  exactLocation: string
  city: string
  country: string
}

function loadSavedDetails(): Partial<SavedDetails> | null {
  if (typeof window === "undefined") return null
  try {
    const raw = localStorage.getItem(SAVED_DETAILS_KEY)
    return raw ? (JSON.parse(raw) as Partial<SavedDetails>) : null
  } catch {
    return null
  }
}

function CopyButton({ value, label = "Copy" }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value)
          setCopied(true)
          setTimeout(() => setCopied(false), 2000)
        } catch {
          // Clipboard blocked; the number is still visible to copy by hand.
        }
      }}
      className="ml-3 shrink-0 rounded-full border border-stone-300 px-3 py-1 text-[11px] uppercase tracking-[0.15em] text-stone-700 transition-colors hover:border-stone-900"
    >
      {copied ? "Copied" : label}
    </button>
  )
}

type DeliveryQuoteView = {
  fee: number
  distanceKm: number
  durationMin: number
  currency: string
  estimated?: boolean
  zoneName?: string
}

export function CheckoutForm({
  storeId,
  currency,
  paymentSetting,
  deliveryPolicy,
  basePath,
  shoporaDeliveryEnabled,
}: {
  storeId: string
  currency: string
  paymentSetting: any
  deliveryPolicy?: string | null
  basePath: string
  shoporaDeliveryEnabled?: boolean
}) {
  const { items, getTotalPrice, clearCart } = useCart()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [deliveryMethod, setDeliveryMethod] = useState<"VENDOR" | "SHOPORA">(
    shoporaDeliveryEnabled ? "SHOPORA" : "VENDOR"
  )
  // The form only renders once the (browser-only) cart has items, so reading saved details here is safe.
  const [saved] = useState(loadSavedDetails)
  const [exactLocation, setExactLocation] = useState(saved?.exactLocation ?? "")
  const [city, setCity] = useState(saved?.city || (shoporaDeliveryEnabled ? "Accra" : ""))
  const [country, setCountry] = useState(saved?.country || "Ghana")
  const [quote, setQuote] = useState<DeliveryQuoteView | null>(null)
  const [quoteError, setQuoteError] = useState<string | null>(null)
  const [quoting, startQuote] = useTransition()
  const [email, setEmail] = useState(saved?.email ?? "")
  const [phone, setPhone] = useState(saved?.phone ?? "")
  const [firstName, setFirstName] = useState(saved?.firstName ?? "")
  const [lastName, setLastName] = useState(saved?.lastName ?? "")
  const [restored, setRestored] = useState(!!saved)

  function forgetDetails() {
    localStorage.removeItem(SAVED_DETAILS_KEY)
    setEmail("")
    setPhone("")
    setFirstName("")
    setLastName("")
    setExactLocation("")
    setCity(shoporaDeliveryEnabled ? "Accra" : "")
    setCountry("Ghana")
    setRestored(false)
  }

  useEffect(() => {
    if (!shoporaDeliveryEnabled || deliveryMethod !== "SHOPORA") return
    if (exactLocation.trim().length < 4 || city.trim().length < 2) return

    const handle = setTimeout(() => {
      startQuote(async () => {
        const result = await quoteShoporaDeliveryAction({
          storeId,
          exactLocation,
          city,
          country,
        })
        if ("error" in result) {
          setQuote(null)
          setQuoteError(result.error)
          return
        }
        setQuoteError(null)
        setQuote({
          fee: result.quote.fee,
          distanceKm: result.quote.distanceKm,
          durationMin: result.quote.durationMin,
          currency: result.quote.currency,
          estimated: result.quote.estimated === true || result.quote.source === "estimated",
          zoneName: result.quote.zoneName,
        })
      })
    }, 700)

    return () => clearTimeout(handle)
  }, [shoporaDeliveryEnabled, deliveryMethod, exactLocation, city, country, storeId])

  const canQuote =
    !!shoporaDeliveryEnabled &&
    deliveryMethod === "SHOPORA" &&
    exactLocation.trim().length >= 4 &&
    city.trim().length >= 2
  const activeQuote = canQuote ? quote : null
  const activeQuoteError = canQuote ? quoteError : null

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
      formData.set("deliveryMethod", deliveryMethod)
      formData.set("exactLocation", exactLocation)
      formData.set("city", city)
      formData.set("country", country)

      const result = await processCheckoutAction(formData)
      if ("error" in result) {
        setError(result.error ?? "Checkout failed. Please try again.")
        return
      }

      try {
        const details: SavedDetails = { email, phone, firstName, lastName, exactLocation, city, country }
        localStorage.setItem(SAVED_DETAILS_KEY, JSON.stringify(details))
      } catch {
        // Storage full or blocked; the order still went through.
      }
      clearCart()
      const track =
        "trackingToken" in result && result.trackingToken
          ? `&track=${encodeURIComponent(result.trackingToken)}`
          : ""
      router.push(`${basePath}/checkout/success?orderId=${encodeURIComponent(result.orderNumber)}${track}`)
    } catch (err) {
      console.error(err)
      setError("Checkout failed. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const productTotal = getTotalPrice()

  return (
    <div className="grid gap-12 lg:grid-cols-[1.2fr_1fr] lg:gap-16">
      <form action={handleSubmit} className="order-2 grid gap-10 lg:order-1">
        <section className="grid gap-5">
          <div className="flex items-baseline justify-between gap-4">
            <h2 className="font-display text-3xl">1. Contact</h2>
            {restored && (
              <button type="button" onClick={forgetDetails} className="text-xs text-stone-500 underline underline-offset-4 hover:text-stone-900">
                Not you? Clear details
              </button>
            )}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="email" label="Email">
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClass}
              />
            </Field>
            <Field id="phone" label="Phone number">
              <input
                id="phone"
                name="phone"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                required
                placeholder="024 123 4567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className={inputClass}
              />
            </Field>
          </div>
        </section>

        <section className="grid gap-5">
          <h2 className="font-display text-3xl">2. Delivery</h2>
          {deliveryPolicy && (
            <p className="border-l-2 border-[var(--store-accent)] bg-[#f3efe8] px-4 py-3 text-sm leading-relaxed text-stone-700">
              {deliveryPolicy}
            </p>
          )}

          {shoporaDeliveryEnabled && (
            <div className="grid gap-3">
              <p className="text-[11px] uppercase tracking-[0.18em] text-stone-500">Delivery option</p>
              <label className={`flex cursor-pointer gap-3 border p-4 ${deliveryMethod === "SHOPORA" ? "border-stone-900 bg-[#faf8f5]" : "border-stone-300"}`}>
                <input
                  type="radio"
                  name="deliveryMethodChoice"
                  className="mt-1"
                  checked={deliveryMethod === "SHOPORA"}
                  onChange={() => setDeliveryMethod("SHOPORA")}
                />
                <span>
                  <span className="block text-sm font-medium text-stone-900">Shopora Delivery (Accra)</span>
                  <span className="mt-1 block text-sm text-stone-600">
                    Live rate at checkout. Pay the rider when your order arrives. Pay the store for your items only.
                  </span>
                </span>
              </label>
              <label className={`flex cursor-pointer gap-3 border p-4 ${deliveryMethod === "VENDOR" ? "border-stone-900 bg-[#faf8f5]" : "border-stone-300"}`}>
                <input
                  type="radio"
                  name="deliveryMethodChoice"
                  className="mt-1"
                  checked={deliveryMethod === "VENDOR"}
                  onChange={() => setDeliveryMethod("VENDOR")}
                />
                <span>
                  <span className="block text-sm font-medium text-stone-900">Store arranges delivery</span>
                  <span className="mt-1 block text-sm text-stone-600">
                    The store will contact you to arrange a rider. Delivery fee is agreed separately.
                  </span>
                </span>
              </label>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <Field id="firstName" label="First name">
              <input
                id="firstName"
                name="firstName"
                autoComplete="given-name"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className={inputClass}
              />
            </Field>
            <Field id="lastName" label="Last name">
              <input
                id="lastName"
                name="lastName"
                autoComplete="family-name"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className={inputClass}
              />
            </Field>
          </div>
          <Field id="exactLocation" label="Exact location">
            <PlaceAutocomplete
              id="exactLocation"
              name="exactLocation"
              required
              placeholder="Type your area, street, or landmark"
              className={inputClass}
              value={exactLocation}
              onChange={setExactLocation}
              onPlaceSelect={(place) => {
                setExactLocation(place.exactLocation)
                if (place.city) setCity(place.city)
                if (shoporaDeliveryEnabled) setCountry("Ghana")
              }}
            />
            <p className="text-xs text-stone-500">
              Suggestions are optional — you can type any Accra address. The rider will open it in Google Maps.
            </p>
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field id="city" label="City">
              <input
                id="city"
                name="city"
                autoComplete="address-level2"
                required
                className={inputClass}
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
            </Field>
            <Field id="country" label="Country">
              <select
                id="country"
                name="country"
                required
                className={`${inputClass} cursor-pointer`}
                value={country}
                onChange={(e) => setCountry(e.target.value)}
              >
                {COUNTRIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </Field>
          </div>

          {shoporaDeliveryEnabled && deliveryMethod === "SHOPORA" && (
            <div className="border border-stone-300 bg-[#faf8f5] px-4 py-4 text-sm text-stone-700">
              {quoting && <p>Getting live delivery rate…</p>}
              {!quoting && activeQuote && (
                <p>
                  <strong className="text-stone-900">
                    {activeQuote.estimated ? "Estimated rate" : "Live rate"}:{" "}
                    {money(activeQuote.currency, activeQuote.fee)}
                  </strong>
                  {!activeQuote.estimated && (
                    <>
                      {" · "}~{activeQuote.durationMin} mins · {activeQuote.distanceKm} km
                    </>
                  )}
                  {activeQuote.zoneName && (
                    <span className="mt-1 block text-stone-600">Zone: {activeQuote.zoneName}</span>
                  )}
                  <span className="mt-1 block text-stone-500">
                    {activeQuote.estimated
                      ? "We couldn’t pin this spot on the free map index, so this is our Accra standard estimate. Your full written address still goes to the rider for Google Maps."
                      : "Pay this to the Shopora rider on arrival. It is not included in what you send the store."}
                  </span>
                </p>
              )}
              {!quoting && activeQuoteError && <p className="text-red-700">{activeQuoteError}</p>}
            </div>
          )}
        </section>

        <section className="grid gap-5">
          <h2 className="font-display text-3xl">3. Payment</h2>
          <p className="text-sm leading-relaxed text-stone-600">
            Send the product total using the payment details on this page, then enter your transaction ID or reference below.
            {deliveryMethod === "SHOPORA" && " Delivery is paid to the rider when they arrive."}
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
          disabled={isSubmitting || (deliveryMethod === "SHOPORA" && !!shoporaDeliveryEnabled && !activeQuote)}
          className="h-13 w-full rounded-full bg-[var(--store-accent)] text-sm tracking-wide text-white transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {isSubmitting ? "Placing your order..." : `Place order · ${money(currency, productTotal)}`}
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
            {activeQuote && (
              <div className="mt-4 flex items-baseline justify-between text-sm">
                <span className="text-stone-600">Shopora Delivery (pay rider)</span>
                <span className="text-stone-900">{money(activeQuote.currency, activeQuote.fee)}</span>
              </div>
            )}
            <div className="mt-6 flex items-baseline justify-between border-t border-stone-300/60 pt-6">
              <span className="text-sm text-stone-600">Pay store now</span>
              <span className="font-display text-3xl">{money(currency, productTotal)}</span>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-stone-500">
              {deliveryMethod === "SHOPORA"
                ? "Product total goes to the store. Delivery fee is paid to the Shopora rider on arrival."
                : "Delivery is not included. You pay the rider when your order arrives."}
            </p>
          </div>

          <div className="border border-stone-300 p-6 md:p-8">
            <h2 className="text-[11px] uppercase tracking-[0.2em] text-stone-500">How to pay</h2>
            <p className="mt-3 flex flex-wrap items-center text-sm text-stone-700">
              <span>
                Send exactly <strong className="font-medium text-stone-900">{money(currency, productTotal)}</strong> to:
              </span>
              <CopyButton value={productTotal.toFixed(2)} label="Copy amount" />
            </p>
            {!paymentSetting ? (
              <p className="mt-4 text-sm text-red-700">This store has not added its payment details yet. Please contact the store before paying.</p>
            ) : (
              <div className="mt-5 grid gap-5">
                {paymentSetting.mobileMoneyNumber && (
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.18em] text-stone-500">Mobile Money</p>
                    <div className="mt-1 flex items-center">
                      <p className="text-xl tracking-wide text-stone-900">{paymentSetting.mobileMoneyNumber}</p>
                      <CopyButton value={paymentSetting.mobileMoneyNumber.replace(/[^\d+]/g, "") || paymentSetting.mobileMoneyNumber} />
                    </div>
                    {paymentSetting.accountName && <p className="text-sm text-stone-600">{paymentSetting.accountName}</p>}
                    <a
                      href="tel:*170%23"
                      className="mt-3 inline-flex h-10 items-center rounded-full border border-stone-900 px-5 text-sm text-stone-900 md:hidden"
                    >
                      Dial *170# (MTN MoMo)
                    </a>
                  </div>
                )}
                {paymentSetting.bankName && (
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.18em] text-stone-500">Bank transfer</p>
                    <p className="mt-1 text-sm text-stone-700">{paymentSetting.bankName}</p>
                    <div className="flex items-center">
                      <p className="text-xl tracking-wide text-stone-900">{paymentSetting.accountNumber}</p>
                      {paymentSetting.accountNumber && <CopyButton value={paymentSetting.accountNumber} />}
                    </div>
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
