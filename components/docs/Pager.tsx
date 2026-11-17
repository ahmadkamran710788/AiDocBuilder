import Link from 'next/link';
import type { Doc, PageMeta } from '@/lib/content';

/** Previous / next page inside one documentation. */
export function Pager({ doc, prev, next }: { doc: Doc; prev?: PageMeta; next?: PageMeta }) {
  return (
    <nav className="pager" aria-label="Previous and next page">
      {prev ? (
        <Link className="prev" href={`/${doc.id}/${prev.slug}`}>
          <small>Previous</small>
          <b>← {prev.title}</b>
        </Link>
      ) : (
        <Link className="prev" href={`/${doc.id}`}>
          <small>Back to</small>
          <b>← {doc.title}</b>
        </Link>
      )}
      {next && (
        <Link className="next" href={`/${doc.id}/${next.slug}`}>
          <small>Next</small>
          <b>{next.title} →</b>
        </Link>
      )}
    </nav>
  );
}
