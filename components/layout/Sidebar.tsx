import Link from 'next/link';
import type { Doc, PageMeta } from '@/lib/content';
import { DocSwitch } from './DocSwitch';

type Props = {
  docs: Doc[];
  /** The documentation being read. Without it the sidebar lists all documentations. */
  doc?: string;
  /** Pages of that documentation. */
  pages: PageMeta[];
  /** Active page slug, '' for the documentation overview, 'share' for the link picker. */
  active?: string;
  productVersion: string;
};

export function Sidebar({ docs, doc, pages, active, productVersion }: Props) {
  return (
    <nav className="side" aria-label="Documentation">
      <DocSwitch docs={docs} current={doc} />
      {doc ? (
        <>
          <Link href={`/${doc}`} className={active === '' ? 'active' : ''}>
            Overview
          </Link>
          {pages.map((p) => (
            <Link key={p.slug} href={`/${doc}/${p.slug}`} className={active === p.slug ? 'active' : ''}>
              {p.title}
            </Link>
          ))}
        </>
      ) : (
        <>
          <h3>Documentation</h3>
          {docs.map((d) => (
            <Link key={d.id} href={`/${d.id}`}>
              {d.title}
            </Link>
          ))}
          <h3>Support</h3>
          <Link href="/share" className={active === 'share' ? 'active' : ''}>
            Share links
          </Link>
        </>
      )}
      <p className="ver">{productVersion}</p>
    </nav>
  );
}
