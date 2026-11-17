import Link from 'next/link';
import type { Doc } from '@/lib/content';
import { CopyButton } from '../ui/CopyButton';

/** "Share this guide": the documentation's link, a copy button and the PDF version. */
export function ShareBox({ doc, baseUrl }: { doc: Doc; baseUrl: string }) {
  return (
    <div className="share-box">
      <b>Share this guide</b>
      <code>{`${baseUrl}/${doc.id}`}</code>
      <CopyButton path={`/${doc.id}`} label={doc.title}>
        Copy link
      </CopyButton>
      <Link className="btn sm" href={`/${doc.id}/print`}>
        Download PDF
      </Link>
    </div>
  );
}
