import Link from 'next/link';
import type { Doc } from '@/lib/content';
import { CopyButton } from '../ui/CopyButton';

/** One documentation on the portal home page. */
export function DocCard({ doc, pageCount }: { doc: Doc; pageCount: number }) {
  return (
    <div className="doc-card">
      <h3>
        <Link href={`/${doc.id}`}>{doc.title}</Link>
      </h3>
      <p>{doc.description}</p>
      <span className="meta">
        {pageCount} page{pageCount === 1 ? '' : 's'}
      </span>
      <div className="row">
        <Link className="btn primary sm" href={`/${doc.id}`}>
          Open
        </Link>
        <CopyButton path={`/${doc.id}`} label={doc.title}>
          Copy link
        </CopyButton>
      </div>
    </div>
  );
}
