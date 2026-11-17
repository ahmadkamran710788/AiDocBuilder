'use client';

import type { EditorController } from './useEditor';

/** Save, submit, approve, discard… Which buttons show depends on status and role. */
export function WorkflowActions({ editor, isReviewer }: { editor: EditorController; isReviewer: boolean }) {
  const { cur, dirty, busy } = editor;
  if (!cur) return null;
  const inReview = cur.status === 'review' && !dirty;
  const canSubmit = cur.status === 'draft' || dirty;
  return (
    <div className="ed-actions">
      {cur.status !== 'published' && !dirty && (
        <button className="btn ghost" type="button" onClick={editor.discard} disabled={busy}>
          Discard draft
        </button>
      )}
      {cur.status === 'published' && !dirty && isReviewer && (
        <button className="btn ghost" type="button" onClick={editor.unpublish} disabled={busy}>
          Unpublish
        </button>
      )}
      {cur.hasLive && (
        <a className="btn ghost" href={`/${cur.doc}/${cur.slug}`} target="_blank" rel="noopener">
          View live page ↗
        </a>
      )}
      {(dirty || cur.status === 'draft') && (
        <button className={`btn${dirty ? ' primary' : ''}`} type="button" onClick={editor.save} disabled={!dirty || busy} title="Ctrl/⌘ S">
          {editor.uploading > 0 ? 'Uploading picture…' : dirty ? 'Save draft' : 'Saved'}
        </button>
      )}
      {canSubmit && (
        <button className={`btn${dirty ? '' : ' primary'}`} type="button" onClick={editor.submit} disabled={busy}>
          Submit for review
        </button>
      )}
      {inReview && isReviewer && (
        <>
          <button className="btn" type="button" onClick={editor.requestChanges} disabled={busy}>
            Request changes
          </button>
          <button className="btn primary" type="button" onClick={editor.publish} disabled={busy}>
            Approve and publish
          </button>
        </>
      )}
    </div>
  );
}
