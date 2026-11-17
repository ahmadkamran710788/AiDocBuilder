'use client';

import { CopyButton } from '../ui/CopyButton';
import type { EditorController } from './useEditor';

/** Where the page lives: its documentation, its link, and its place in the menu. */
export function PageMeta({ editor }: { editor: EditorController }) {
  const { cur, state, busy } = editor;
  if (!cur) return null;
  const siblings = (state?.pages ?? []).filter((p) => p.doc === cur.doc);
  const at = siblings.findIndex((p) => p.slug === cur.slug);
  const path = `/${cur.doc}/${cur.slug}`;
  return (
    <div className="ed-meta">
      <span className="doc-chip" title="The documentation this page belongs to">
        {editor.docTitle(cur.doc)}
      </span>
      <span className="ed-link">
        <code>{path}</code>
        {cur.hasLive && (
          <CopyButton className="link-btn" path={path} label={cur.title}>
            Copy link
          </CopyButton>
        )}
      </span>
      <span className="ed-order">
        Page {at + 1} of {siblings.length} in the menu
        <button className="mini-btn" type="button" onClick={() => editor.move('up')} disabled={busy || at <= 0} aria-label="Move page up in the menu" title="Move up">
          ↑
        </button>
        <button className="mini-btn" type="button" onClick={() => editor.move('down')} disabled={busy || at >= siblings.length - 1} aria-label="Move page down in the menu" title="Move down">
          ↓
        </button>
      </span>
    </div>
  );
}
