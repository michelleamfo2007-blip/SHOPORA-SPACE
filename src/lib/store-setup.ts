import { db } from "@/lib/db"

const PRODUCTS_FOR_A_FULL_STORE = 3

export type StoreSetupStepKey = "logo" | "cover" | "headline" | "description" | "payments" | "products" | "contact"

export type StoreSetupStep = {
  key: StoreSetupStepKey
  label: string
  hint: string
  done: boolean
}

export type StoreSetup = {
  percent: number
  steps: StoreSetupStep[]
}

/** What a seller still needs to fill in for their storefront to look finished. */
export async function getStoreSetup(storeId: string): Promise<StoreSetup | null> {
  const [store, payment, productsWithPhotos] = await Promise.all([
    db.store.findUnique({
      where: { id: storeId },
      select: {
        logoUrl: true,
        heroImage: true,
        heroHeadline: true,
        description: true,
        aboutText: true,
        whatsappNumber: true,
        instagramHandle: true,
        tiktokHandle: true,
        contactEmail: true,
      },
    }),
    db.storePaymentSetting.findUnique({
      where: { storeId },
      select: { mobileMoneyNumber: true, accountNumber: true },
    }),
    db.product.count({
      where: { storeId, status: "ACTIVE", visibility: "VISIBLE", images: { isEmpty: false } },
    }),
  ])
  if (!store) return null

  const steps: StoreSetupStep[] = [
    {
      key: "products",
      label: `Add ${PRODUCTS_FOR_A_FULL_STORE} products with photos`,
      hint: `${Math.min(productsWithPhotos, PRODUCTS_FOR_A_FULL_STORE)} of ${PRODUCTS_FOR_A_FULL_STORE} so far`,
      done: productsWithPhotos >= PRODUCTS_FOR_A_FULL_STORE,
    },
    {
      key: "payments",
      label: "Add your MoMo or bank details",
      hint: "Customers can't pay you without them",
      done: !!(payment?.mobileMoneyNumber?.trim() || payment?.accountNumber?.trim()),
    },
    { key: "logo", label: "Upload your logo", hint: "Shown beside your store name", done: !!store.logoUrl },
    { key: "cover", label: "Add a cover image", hint: "The big picture at the top of your store", done: !!store.heroImage },
    { key: "headline", label: "Write a homepage headline", hint: "A short line that sells your brand", done: !!store.heroHeadline?.trim() },
    {
      key: "description",
      label: "Describe your store",
      hint: "A sentence or two about what you sell",
      done: !!(store.description?.trim() || store.aboutText?.trim()),
    },
    {
      key: "contact",
      label: "Add WhatsApp or Instagram",
      hint: "So customers can reach you",
      done: !!(store.whatsappNumber?.trim() || store.instagramHandle?.trim() || store.tiktokHandle?.trim() || store.contactEmail?.trim()),
    },
  ]

  const done = steps.filter((s) => s.done).length
  return { percent: Math.round((done / steps.length) * 100), steps }
}
