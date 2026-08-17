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
 * Resolves the store ID based on the hostname.
 * It checks if it's a subdomain first, if not, it checks the custom domain.
 */
export async function getStoreByHost(host: string | null) {
  if (!host) return null;

  const subdomain = getSubdomain(host);

  if (subdomain) {
    // It's a shopora.space subdomain
    return db.store.findUnique({
      where: { slug: subdomain },
      include: {
        subscription: true,
      }
    });
  } else {
    // It's a custom domain (e.g., www.mystore.com)
    const domain = await db.domain.findUnique({
      where: { domainName: host },
      include: {
        store: {
          include: {
            subscription: true
          }
        }
      },
    });

    return domain?.store || null;
  }
}
