import Link from 'next/link';
import { connection } from 'next/server';
import { Shell } from '@/components/layout/Shell';
import { SearchBox } from '@/components/search/SearchBox';
import { listPublicDocs } from '@/lib/content';

export default async function NotFound() {
  await connection(); // render per request so the menu always lists the current documentations
  const docs = await listPublicDocs();
  return (
    <Shell>
      <article className="page">
        <p className="eyebrow">Page not found</p>
        <h1>We could not find that page</h1>
        <p className="lead">The link may be old, or the page may have moved. Search the documentation, or start from the home page.</p>
        <div className="notfound-search">
          <SearchBox docs={docs} slashFocus={false} />
        </div>
        <p>
          <Link className="btn primary" href="/">
            Go to the docs home
          </Link>
        </p>
      </article>
    </Shell>
  );
}
