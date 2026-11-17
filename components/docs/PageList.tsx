import Link from 'next/link';
import type { Page } from '@/lib/content';
import { excerpt, renderContent } from '@/lib/render';

/** Pages of one documentation, on its landing page. */
export function PageList({ pages }: { pages: Page[] }) {
  return (
    <ul className="page-list">
      {pages.map((p) => (
        <li key={p.slug}>
          <Link href={`/${p.doc}/${p.slug}`}>
            <b>{p.title}</b>
            <span>{p.description || excerpt(renderContent(p).text, 130)}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
