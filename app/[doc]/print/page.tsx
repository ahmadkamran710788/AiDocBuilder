import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PrintButton } from '@/components/docs/PrintButton';
import { getDoc, getSettings, listLivePages } from '@/lib/content';
import { renderContent } from '@/lib/render';

export const dynamic = 'force-dynamic';
type Props = { params: Promise<{ doc: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const doc = await getDoc((await params).doc);
  return doc ? { title: `${doc.title} (printable)`, robots: { index: false } } : {};
}

/** The whole documentation on one page, laid out for "Save as PDF". */
export default async function PrintGuide({ params }: Props) {
  const doc = await getDoc((await params).doc);
  if (!doc) notFound();
  const [pages, settings] = await Promise.all([listLivePages(doc.id), getSettings()]);
  if (!pages.length) notFound();
  return (
    <div className="print-doc page">
      <div className="print-bar">
        <PrintButton />
        <span>In the print window choose “Save as PDF” to get a file you can send to a customer.</span>
        <Link href={`/${doc.id}`}>Back to {doc.title}</Link>
      </div>
      <p className="eyebrow">AIDocBuilder · {settings.productVersion}</p>
      <h1>{doc.title}</h1>
      <p className="lead">{doc.description}</p>
      {pages.map((p) => (
        <section key={p.slug}>
          <h1 className="sec">{p.title}</h1>
          <div dangerouslySetInnerHTML={{ __html: renderContent(p).html }} />
        </section>
      ))}
    </div>
  );
}
