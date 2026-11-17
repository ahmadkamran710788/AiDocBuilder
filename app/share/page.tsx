import type { Metadata } from 'next';
import { ShareDocSection } from '@/components/docs/ShareDocSection';
import { Shell } from '@/components/layout/Shell';
import { listAllLivePages, listPublicDocs } from '@/lib/content';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Share links', robots: { index: false } };

/** Support "link picker": copy the link of any guide, page or section. */
export default async function Share() {
  const [docs, pagesByDoc] = await Promise.all([listPublicDocs(), listAllLivePages()]);
  return (
    <Shell active="share">
      <article className="page">
        <p className="eyebrow">Support</p>
        <h1>Share links</h1>
        <p className="lead">
          When a customer asks for one guide, page or section, copy its link here and send it. The link opens only that part, with that
          guide&apos;s own menu.
        </p>
        {docs.map((d) => (
          <ShareDocSection key={d.id} doc={d} pages={pagesByDoc.get(d.id) ?? []} />
        ))}
      </article>
    </Shell>
  );
}
