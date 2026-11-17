import { DocCard } from '@/components/docs/DocCard';
import { Shell } from '@/components/layout/Shell';
import { getSettings, listAllLivePages, listPublicDocs } from '@/lib/content';

export const dynamic = 'force-dynamic';

/** Portal home: every documentation as a card. */
export default async function Home() {
  const [docs, pagesByDoc, settings] = await Promise.all([listPublicDocs(), listAllLivePages(), getSettings()]);
  return (
    <Shell>
      <article className="page">
        <div className="hero">
          <p className="eyebrow">AIDocBuilder · {settings.productVersion}</p>
          <h1>{settings.heroTitle}</h1>
          <p className="lead">{settings.heroLead}</p>
        </div>
        {docs.length ? (
          <div className="doc-cards">
            {docs.map((d) => (
              <DocCard key={d.id} doc={d} pageCount={pagesByDoc.get(d.id)?.length ?? 0} />
            ))}
          </div>
        ) : (
          <div className="empty-doc">No documentation has been published yet.</div>
        )}
      </article>
    </Shell>
  );
}
