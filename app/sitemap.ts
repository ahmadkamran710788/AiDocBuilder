import type { MetadataRoute } from 'next';
import { listAllLivePages, listPublicDocs } from '@/lib/content';
import { baseUrl } from '@/lib/site';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = baseUrl();
  const [docs, pagesByDoc] = await Promise.all([listPublicDocs(), listAllLivePages()]);
  const out: MetadataRoute.Sitemap = [{ url: `${base}/` }];
  for (const d of docs) {
    out.push({ url: `${base}/${d.id}` });
    for (const p of pagesByDoc.get(d.id) ?? []) out.push({ url: `${base}/${d.id}/${p.slug}`, lastModified: p.updated ?? undefined });
  }
  return out;
}
