'use client';

import { STATUS_LABEL, StatusPill } from '../ui/StatusPill';
import { ActivityLog } from './ActivityLog';
import type { StatusFilter } from './types';
import type { EditorController } from './useEditor';

const FILTERS: StatusFilter[] = ['all', 'draft', 'review', 'published'];

/** Left column: create and import buttons, filters, the page list and the activity log. */
export function PagesPanel({ editor, isReviewer }: { editor: EditorController; isReviewer: boolean }) {
  const { state, cur, form, dirty, busy, rows, filter, docFilter } = editor;
  const ready = !!state;
  const count = (f: StatusFilter) => (state?.pages ?? []).filter((p) => (f === 'all' || p.status === f) && (!docFilter || p.doc === docFilter)).length;
  return (
    <aside className="ed-list">
      <div className="ed-list-head">
        <h2>Pages</h2>
      </div>
      <div className="ed-create">
        <button className="btn primary" type="button" onClick={editor.newPage} disabled={busy || !ready}>
          + New page
        </button>
        <button className="btn" type="button" onClick={() => editor.setModal('import')} disabled={!ready} title="Word file, Markdown file, or pasted text">
          Import…
        </button>
      </div>
      <div className="doc-switch" style={{ margin: '16px 0 0' }}>
        <label htmlFor="edDocFilter">Documentation</label>
        <select id="edDocFilter" className="select" value={docFilter} onChange={(e) => editor.setDocFilter(e.target.value)}>
          <option value="">All documentation</option>
          {state?.docs.map((d) => (
            <option key={d.id} value={d.id}>
              {d.title}
            </option>
          ))}
        </select>
        <span className="doc-links">
          <button className="link-btn" type="button" onClick={() => editor.setModal('doc')} disabled={!ready}>
            + New documentation
          </button>
          {isReviewer && docFilter && (
            <button className="link-btn danger" type="button" onClick={() => editor.deleteDoc(docFilter)} disabled={busy}>
              Delete “{editor.docTitle(docFilter)}”
            </button>
          )}
        </span>
      </div>
      <div className="chips">
        {FILTERS.map((f) => (
          <button key={f} type="button" className={filter === f ? 'on' : ''} aria-pressed={filter === f} onClick={() => editor.setFilter(f)}>
            {f === 'all' ? 'All' : f === 'draft' ? 'Drafts' : STATUS_LABEL[f]} <span className="n">{count(f)}</span>
          </button>
        ))}
      </div>
      <ul className="ed-pages">
        {rows.map((p) => {
          const on = cur?.doc === p.doc && cur.slug === p.slug;
          return (
            <li key={`${p.doc}/${p.slug}`}>
              <button type="button" className={on ? 'on' : ''} disabled={busy} onClick={() => !on && editor.select(p.doc, p.slug)}>
                <span className="t">{(on ? form.title : p.title) || 'Untitled page'}</span>
                <span className="m">
                  <StatusPill status={on && dirty ? 'unsaved' : p.status} />
                  {editor.docTitle(p.doc)}
                </span>
              </button>
            </li>
          );
        })}
        {ready && !rows.length && <li className="ed-empty">No pages in this list.</li>}
      </ul>
      <ActivityLog entries={state?.activity ?? []} />
    </aside>
  );
}
