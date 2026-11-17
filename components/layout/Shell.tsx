import { getSettings, listLivePages, listPublicDocs } from '@/lib/content';
import { Footer } from './Footer';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';

type Props = {
  /** Documentation being read: the sidebar then shows only its pages. */
  doc?: string;
  /** Active sidebar entry: a page slug, '' for the overview, 'share' for the link picker. */
  active?: string;
  /** Content of the right-hand "On this page" column. */
  toc?: React.ReactNode;
  children: React.ReactNode;
};

/** Reading layout: app bar, sidebar, reading column and table of contents. */
export async function Shell({ doc, active, toc, children }: Props) {
  const [docs, settings, pages] = await Promise.all([listPublicDocs(), getSettings(), doc ? listLivePages(doc) : []]);
  return (
    <>
      <TopBar docs={docs} doc={doc} settings={settings} />
      <div className="shell">
        <Sidebar docs={docs} doc={doc} pages={pages} active={active} productVersion={settings.productVersion} />
        <main>{children}</main>
        <aside className="toc" aria-label="On this page">
          {toc}
        </aside>
        <Footer productVersion={settings.productVersion} />
      </div>
    </>
  );
}
