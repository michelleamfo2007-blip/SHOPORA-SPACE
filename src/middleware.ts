import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
}

export function middleware(req: NextRequest) {
  const url = req.nextUrl
  const hostname = req.headers.get("host") || ""

  // Keep localhost and the main domain intact. 
  // e.g. "shopora.space", "www.shopora.space", "localhost:3000"
  const isMainDomain = 
    hostname === "localhost:3000" || 
    hostname === "shopora.space" || 
    hostname === "www.shopora.space" ||
    hostname.endsWith(".vercel.app") // Prevent Vercel preview domains from breaking

  // If it's a subdomain (e.g. myawesomeshop.shopora.space)
  if (!isMainDomain) {
    // Extract the subdomain (myawesomeshop)
    const subdomain = hostname.split(".")[0]
    
    // Rewrite to the storefront route: /storefront/[domain]
    return NextResponse.rewrite(new URL(`/storefront/${subdomain}${url.pathname}`, req.url))
  }

  return NextResponse.next()
}
