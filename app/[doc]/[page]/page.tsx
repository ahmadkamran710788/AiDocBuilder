import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Article } from '@/components/docs/Article';
import { Breadcrumb } from '@/components/docs/Breadcrumb';
import { Feedback } from '@/components/docs/Feedback';
import { LastUpdated } from '@/components/docs/LastUpdated';
import { PageActions } from '@/components/docs/PageActions';
import { Pager } from '@/components/docs/Pager';
import { Toc } from '@/components/docs/Toc';
import { Shell } from '@/components/layout/Shell';
import { getDoc, getLivePage, listLivePages } from '@/lib/content';
import { excerpt, renderContent } from '@/lib/render';

export const dynamic = 'force-dynamic';
type Props = { params: Promise<{ doc: string; page: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { doc: docId, page: slug } = await params;
  const [doc, page] = await Promise.all([getDoc(docId), getLivePage(docId, slug)]);
  if (!doc || !page) return {};
  const description = page.description || excerpt(renderContent(page).text, 160);
  return {
    title: `${page.title} · ${doc.title}`,
    description,
    alternates: { canonical: `/${doc.id}/${page.slug}` },
    openGraph: { title: page.title, description, type: 'article' },
  };
}

export default async function DocPage({ params }: Props) {
  const { doc: docId, page: slug } = await params;
  const [doc, page, pages] = await Promise.all([getDoc(docId), getLivePage(docId, slug), listLivePages(docId)]);
  if (!doc || !page) notFound();
  const { html, headings } = renderContent(page);
  const i = pages.findIndex((p) => p.slug === page.slug);

  return (
    <Shell doc={doc.id} active={page.slug} toc={<Toc headings={headings.filter((h) => h.depth === 2)} />}>
      <article className="page">
        <Breadcrumb doc={doc} pageTitle={page.title} />
        <p className="eyebrow">{doc.title}</p>
        <h1>{page.title}</h1>
        <PageActions doc={doc} page={page} />
        <Article html={html} />
        <LastUpdated updated={page.updated} by={page.updatedBy} />
        <Feedback doc={doc.id} slug={page.slug} />
        <Pager doc={doc} prev={pages[i - 1]} next={pages[i + 1]} />
      </article>
    </Shell>
  );
}
