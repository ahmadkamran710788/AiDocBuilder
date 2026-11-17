import { headers } from 'next/headers';

export const SITE_NAME = 'AIDocBuilder Docs';

/**
 * The site's public address when it is known without a request:
 * SITE_URL if set, otherwise the address Vercel gives the deployment.
 */
export function configuredSiteUrl(): string | null {
  const explicit = process.env.SITE_URL?.trim();
  if (explicit) return explicit.replace(/\/+$/, '');
  // Set by Vercel: the production domain, or the unique URL of a preview deployment.
  const vercel = process.env.VERCEL_ENV === 'production' ? process.env.VERCEL_PROJECT_PRODUCTION_URL : process.env.VERCEL_URL;
  return vercel ? `https://${vercel}` : null;
}

/** Address used in the sitemap, robots.txt and link previews. */
export const baseUrl = () => configuredSiteUrl() ?? 'http://localhost:3000';

/** Address shown to people (the "Share this guide" box): configured, or else the one this request came in on. */
export async function siteUrl(): Promise<string> {
  const configured = configuredSiteUrl();
  if (configured) return configured;
  const h = await headers();
  const host = h.get('x-forwarded-host') ?? h.get('host') ?? 'localhost:3000';
  const proto = h.get('x-forwarded-proto') ?? (host.startsWith('localhost') || host.startsWith('127.') ? 'http' : 'https');
  return `${proto}://${host}`;
}
