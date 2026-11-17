import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PageList } from '@/components/docs/PageList';
import { ShareBox } from '@/components/docs/ShareBox';
import { Shell } from '@/components/layout/Shell';
import { getDoc, listLivePages } from '@/lib/content';
import { siteUrl } from '@/lib/site';

export const dynamic = 'force-dynamic';
type Props = { params: Promise<{ doc: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const doc = await getDoc((await params).doc);
  if (!doc) return {};
  return { title: doc.title, description: doc.description, alternates: { canonical: `/${doc.id}` }, openGraph: { title: doc.title, description: doc.description } };
}

/** Landing page of one documentation, with its "Share this guide" box. */
export default async function Guide({ params }: Props) {
  const doc = await getDoc((await params).doc);
  if (!doc) notFound();
  const [pages, baseUrl] = await Promise.all([listLivePages(doc.id), siteUrl()]);
  if (!pages.length) notFound(); // nothing published yet: only editors can see it
  return (
    <Shell doc={doc.id} active="">
      <article className="page">
        <p className="eyebrow">Documentation</p>
        <h1>{doc.title}</h1>
        <p className="lead">{doc.description}</p>
        <ShareBox doc={doc} baseUrl={baseUrl} />
        <PageList pages={pages} />
      </article>
    </Shell>
  );
}
