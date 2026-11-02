"use server"

import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import { getStoreAccess } from "@/lib/store-access"
import { db } from "@/lib/db"

export async function generateProductDescriptionAction(input: {
  storeId: string
  name: string
  price?: string
  existingDescription?: string
  categoryHint?: string
}) {
  const access = await getStoreAccess(input.storeId)
  if ("error" in access) return { error: access.error }

  const name = input.name?.trim()
  if (!name) return { error: "Add a product name first, then generate a description." }

  if (!process.env.OPENAI_API_KEY) {
    return { error: "AI description isn’t configured yet. Add OPENAI_API_KEY in Vercel env." }
  }

  const store = await db.store.findUnique({
    where: { id: input.storeId },
    select: { name: true, currency: true },
  })

  try {
    const { text } = await generateText({
      model: openai("gpt-4o-mini"),
      temperature: 0.7,
      maxOutputTokens: 280,
      system: `You write short product descriptions for Ghana online shops on Shopora.
Rules:
- Write in clear, friendly English that Ghanaian buyers trust.
- 2–4 short paragraphs or short lines max. No markdown headings. No bullet lists unless natural.
- Do not invent fake brand certifications, medical claims, or exact materials unless given.
- Mention fit for Accra / everyday Ghana use when it feels natural (heat, style, value) — don’t force it.
- No prices unless provided. No hashtags. No “As an AI”.
- Return ONLY the description text.`,
      prompt: [
        `Store: ${store?.name || "Shopora store"}`,
        `Product name: ${name}`,
        input.price ? `Price: ${store?.currency || "GHS"} ${input.price}` : null,
        input.categoryHint ? `Category / options hint: ${input.categoryHint}` : null,
        input.existingDescription?.trim()
          ? `Merchant notes to improve (rewrite into a polished description):\n${input.existingDescription.trim()}`
          : "No merchant notes — invent a believable, honest sales description from the product name only.",
      ]
        .filter(Boolean)
        .join("\n"),
    })

    const description = text.replace(/^["']|["']$/g, "").trim()
    if (!description) return { error: "AI returned an empty description. Try again." }

    return { description }
  } catch (err) {
    console.error("generateProductDescriptionAction", err)
    return { error: "Could not generate a description right now. Try again in a moment." }
  }
}
