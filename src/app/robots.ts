import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/dashboard/',
        '/super-admin/',
        '/api/',
        '/checkout/',
        '/login/',
        '/signup/',
        '/verify/'
      ],
    },
    sitemap: 'https://shopora.space/sitemap.xml',
  }
}
