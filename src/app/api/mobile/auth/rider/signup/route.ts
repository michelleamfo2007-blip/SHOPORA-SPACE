import { RIDER_PLATFORM_CUT_PERCENT, RIDER_TERMS } from "@/lib/rider-terms"
import { riderSignupAction } from "@/server/actions/rider"

/** Terms summary the app shows before signup. */
export async function GET() {
  return Response.json({
    cutPercent: RIDER_PLATFORM_CUT_PERCENT,
    riderPercent: 100 - RIDER_PLATFORM_CUT_PERCENT,
    version: RIDER_TERMS.version,
    effectiveDate: RIDER_TERMS.effectiveDate,
    termsUrl: "https://www.shopora.space/rider/terms",
  })
}

/** Rider self-signup from the app. Same rules as the web form; account starts PENDING until Shopora approves. */
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))
    const form = new FormData()
    for (const key of ["name", "phone", "email", "momoNumber", "password", "confirmPassword"] as const) {
      form.set(key, String(body[key] ?? ""))
    }
    form.set("acceptTerms", body.acceptTerms === true ? "true" : "")

    const result = await riderSignupAction(form)
    if ("error" in result) return Response.json({ error: result.error }, { status: 400 })
    return Response.json({ success: true })
  } catch (err) {
    console.error("[MOBILE_RIDER_SIGNUP]", err)
    return Response.json({ error: "Could not create your account. Try again." }, { status: 500 })
  }
}
