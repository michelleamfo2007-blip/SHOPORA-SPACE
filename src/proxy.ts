import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export const config = {
  matcher: [
    /*
     * Match all paths except for:
     * 1. /api routes
     * 2. /_next (Next.js internals)
     * 3. /_static (inside /public)
     * 4. all root files inside /public (e.g. /favicon.ico)
     */
    "/((?!api/|_next/|_static/|_vercel|[\\w-]+\\.\\w+).*)",
  ],
}

export default function proxy(req: NextRequest) {
  const url = req.nextUrl

  // Get hostname of request (e.g. mystore.shopora.space, mystore.com)
  const hostname = req.headers
    .get("host")!
    .replace(".localhost:3000", `.${process.env.NEXT_PUBLIC_ROOT_DOMAIN || "shopora.space"}`)

  // Determine if this is the root platform domain or a tenant domain
  const isPlatformDomain =
    hostname === "localhost:3000" ||
    hostname === process.env.NEXT_PUBLIC_ROOT_DOMAIN ||
    hostname === "shopora.space"

  const path = url.pathname

  // 1. Rewrite for the main platform (Marketing pages, Dashboard, Auth)
  if (isPlatformDomain) {
    return NextResponse.rewrite(new URL(`${path === "/" ? "" : path}`, req.url))
  }

  // 2. Rewrite everything else to `/[domain]/[path]` dynamic route
  // This handles both subdomains (mystore.shopora.space) and custom domains (mystore.com)
  return NextResponse.rewrite(new URL(`/${hostname}${path}`, req.url))
}
