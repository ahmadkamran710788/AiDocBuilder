import type { Doc, Page } from '@/lib/content';
import { renderContent } from '@/lib/render';
import { CopyButton } from '../ui/CopyButton';

/** One documentation on the /share link picker: guide, page and section links. */
export function ShareDocSection({ doc, pages }: { doc: Doc; pages: Page[] }) {
  return (
    <section className="share-doc">
      <header>
        <h3>{doc.title}</h3>
        <CopyButton className="btn sm primary" path={`/${doc.id}`} label={doc.title}>
          Copy guide link
        </CopyButton>
      </header>
      {pages.map((p) => {
        const sections = renderContent(p).headings.filter((h) => h.depth === 2);
        return (
          <div className="share-row" key={p.slug}>
            <span className="nm">{p.title}</span>
            <CopyButton path={`/${doc.id}/${p.slug}`} label={p.title}>
              Copy page link
            </CopyButton>
            {sections.length > 0 && (
              <div className="secs">
                {sections.map((h) => (
                  <CopyButton className="chip-btn" key={h.id} path={`/${doc.id}/${p.slug}#${h.id}`} label={h.text}>
                    # {h.text}
                  </CopyButton>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </section>
  );
}
