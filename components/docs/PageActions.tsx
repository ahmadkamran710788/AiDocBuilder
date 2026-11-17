import Link from 'next/link';
import type { Doc, PageMeta } from '@/lib/content';
import { CopyButton } from '../ui/CopyButton';

/** Buttons under a page title: copy its link, go back to the documentation. */
export function PageActions({ doc, page }: { doc: Doc; page: PageMeta }) {
  return (
    <div className="page-actions">
      <CopyButton path={`/${doc.id}/${page.slug}`} label={page.title}>
        Copy link to this page
      </CopyButton>
      <Link className="btn sm ghost" href={`/${doc.id}`}>
        All of {doc.title}
      </Link>
    </div>
  );
}
