import { cache } from "react";
import { db } from "./db";

/**
 * Extracts the subdomain from a given host.
 * Example: if host is "mystore.shopora.space", returns "mystore"
 */
export function getSubdomain(host: string | null): string | null {
  if (!host) return null;
  const isLocalhost = host.includes("localhost");
  const baseDomain = isLocalhost ? "localhost:3000" : "shopora.space";
  
  if (host.includes(`.${baseDomain}`)) {
    return host.replace(`.${baseDomain}`, "");
  }
  return null;
}

/**
 * Resolves the store based on hostname or slug.
 * Checks subdomain first, then falls back to treating host as a raw slug
 * (for /storefront/[slug] routes via vercel.app or direct access).
 */
export const getStoreByHost = cache(async (host: string | null) => {
  if (!host) return null;

  const subdomain = getSubdomain(host);

  // If it's a recognized subdomain, look up by slug
  const slug = subdomain || host;

  const store = await db.store.findUnique({
    where: { slug },
    include: {
      subscription: true,
    }
  });
  if (store) return store

  const alias = await db.domain.findUnique({
    where: { domainName: slug },
    include: { store: { include: { subscription: true } } },
  })
  return alias?.store ?? null
});

