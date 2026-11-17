import Link from 'next/link';
import type { Doc } from '@/lib/content';

export function Breadcrumb({ doc, pageTitle }: { doc: Doc; pageTitle: string }) {
  return (
    <p className="crumb">
      <Link href="/">Docs</Link> › <Link href={`/${doc.id}`}>{doc.title}</Link> › {pageTitle}
    </p>
  );
}
