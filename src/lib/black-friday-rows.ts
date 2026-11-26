import { db } from "@/lib/db"

export type BlackFridayRow = {
  key: string
  name: string
  variantName: string | null
  imageUrl: string | null
  regularPrice: number
  blackFridayPrice: number | null
}

export async function getBlackFridayRows(storeId: string): Promise<BlackFridayRow[]> {
  const products = await db.product.findMany({
    where: { storeId, status: { not: "ARCHIVED" } },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      price: true,
      blackFridayPrice: true,
      images: true,
      _count: { select: { options: true } },
      variants: {
        select: { id: true, name: true, price: true, blackFridayPrice: true },
        orderBy: { name: "asc" },
      },
    },
  })

  return products.flatMap((p): BlackFridayRow[] => {
    const imageUrl = p.images[0] ?? null
    if (p._count.options === 0) {
      const v = p.variants[0]
      return [
        {
          key: `p:${p.id}`,
          name: p.name,
          variantName: null,
          imageUrl,
          regularPrice: v?.price ?? p.price ?? 0,
          blackFridayPrice: v?.blackFridayPrice ?? p.blackFridayPrice,
        },
      ]
    }
    return p.variants.map((v) => ({
      key: `v:${v.id}`,
      name: p.name,
      variantName: v.name,
      imageUrl,
      regularPrice: v.price,
      blackFridayPrice: v.blackFridayPrice,
    }))
  })
}
