import { MetadataRoute } from 'next'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://shopora.space'
  
  // 1. Static public pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    }
  ]

  // 2. Fetch all active stores
  const stores = await db.store.findMany({
    where: {
      status: 'ACTIVE'
    },
    select: {
      slug: true,
      updatedAt: true
    }
  })

  const storeUrls: MetadataRoute.Sitemap = stores.map((store) => ({
    url: `https://${store.slug}.shopora.space`,
    lastModified: store.updatedAt,
    changeFrequency: 'daily',
    priority: 0.8,
  }))

  // 3. Fetch all active/published public products
  const products = await db.product.findMany({
    where: {
      status: 'ACTIVE',
      visibility: 'VISIBLE',
      store: {
        status: 'ACTIVE'
      }
    },
    select: {
      id: true,
      updatedAt: true,
      store: {
        select: {
          slug: true
        }
      }
    }
  })

  const productUrls: MetadataRoute.Sitemap = products.map((product) => ({
    url: `https://${product.store.slug}.shopora.space/product/${product.id}`,
    lastModified: product.updatedAt,
    changeFrequency: 'weekly',
    priority: 0.6,
  }))

  return [...staticPages, ...storeUrls, ...productUrls]
}
