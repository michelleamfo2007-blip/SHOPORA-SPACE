import { ImageResponse } from "next/og"
import { db } from "@/lib/db"
import { SHARE_FORMATS, type ShareFormat } from "@/lib/share-kit"

export const runtime = "nodejs"

/** Product photos can be WebP, which the image renderer can't read, so they're turned into JPEG first. */
async function photoDataUrl(url: string) {
  try {
    const res = await fetch(url)
    if (!res.ok) return null
    const input = Buffer.from(await res.arrayBuffer())
    const type = res.headers.get("content-type") || ""
    if (type.includes("jpeg") || type.includes("png")) return `data:${type};base64,${input.toString("base64")}`
    const sharp = (await import("sharp")).default
    const jpeg = await sharp(input).rotate().resize(1400, 1400, { fit: "inside" }).jpeg({ quality: 85 }).toBuffer()
    return `data:image/jpeg;base64,${jpeg.toString("base64")}`
  } catch (err) {
    console.error("Share image: could not load product photo", err)
    return null
  }
}

/** Branded product card for WhatsApp Status / Instagram. Public, like the product page itself. */
export async function GET(req: Request, { params }: { params: Promise<{ productId: string }> }) {
  const { productId } = await params
  const format: ShareFormat = new URL(req.url).searchParams.get("format") === "square" ? "square" : "story"
  const { width, height } = SHARE_FORMATS[format]

  const product = await db.product.findFirst({
    where: { id: productId, status: "ACTIVE", visibility: "VISIBLE", store: { status: "ACTIVE" } },
    select: {
      name: true,
      price: true,
      images: true,
      variants: { select: { price: true }, orderBy: { price: "asc" }, take: 1 },
      store: { select: { name: true, slug: true, currency: true } },
    },
  })
  if (!product) return new Response("Not found", { status: 404 })

  const price = product.variants[0]?.price ?? product.price ?? 0
  const photo = product.images[0] ? await photoDataUrl(product.images[0]) : null
  const story = format === "story"
  const pad = story ? 80 : 64

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "#f6f2ea",
          color: "#12100e",
          padding: pad,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: story ? 34 : 28 }}>
          <span style={{ letterSpacing: 6, textTransform: "uppercase" }}>{product.store.name}</span>
          <span style={{ color: "#8a6a3d", letterSpacing: 4, textTransform: "uppercase", fontSize: story ? 26 : 22 }}>New in</span>
        </div>

        <div
          style={{
            display: "flex",
            flex: 1,
            marginTop: story ? 56 : 36,
            marginBottom: story ? 56 : 36,
            borderRadius: 28,
            overflow: "hidden",
            background: "#e7dfd2",
          }}
        >
          {photo && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photo} alt="" width={width - pad * 2} height={height} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: story ? 76 : 58, lineHeight: 1.05, fontWeight: 600, display: "flex" }}>
            {product.name.length > 60 ? `${product.name.slice(0, 57)}…` : product.name}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: story ? 32 : 22 }}>
            <span style={{ fontSize: story ? 64 : 50, color: "#8a6a3d", fontWeight: 600 }}>
              {product.store.currency} {price.toLocaleString("en-GB", { maximumFractionDigits: 2 })}
            </span>
            <span
              style={{
                display: "flex",
                background: "#12100e",
                color: "#ffffff",
                borderRadius: 999,
                padding: story ? "22px 40px" : "16px 30px",
                fontSize: story ? 32 : 26,
              }}
            >
              Order now
            </span>
          </div>
          <span style={{ marginTop: story ? 36 : 24, fontSize: story ? 32 : 26, color: "#57534e" }}>
            {product.store.slug}.shopora.space
          </span>
        </div>
      </div>
    ),
    { width, height, headers: { "Cache-Control": "public, max-age=600, s-maxage=3600" } }
  )
}
