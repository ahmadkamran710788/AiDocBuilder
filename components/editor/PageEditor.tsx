'use client';

import { PageHeader } from './PageHeader';
import { RichEditor } from './rich/RichEditor';
import type { EditorController } from './useEditor';

/** Right column: the page being edited. */
export function PageEditor({ editor, isReviewer }: { editor: EditorController; isReviewer: boolean }) {
  const { cur, form, state, loadError } = editor;
  if (!cur) {
    return (
      <div className="ed-main">
        <div className="ed-blank">
          {state ? (
            <>
              <b>No page selected</b>
              <span>Pick a page on the left, create a new one, or import a Word or Markdown file.</span>
            </>
          ) : (
            !loadError && <span>Loading…</span>
          )}
        </div>
      </div>
    );
  }
  return (
    <div className="ed-main">
      <PageHeader editor={editor} isReviewer={isReviewer} />
      <RichEditor
        contentKey={editor.contentKey}
        html={cur.body}
        doc={cur.doc}
        docTitle={editor.docTitle(cur.doc)}
        pageTitle={form.title}
        onReady={editor.setBaseline}
        onChange={editor.setBody}
        onUploading={editor.setUploading}
        onSave={() => editor.dirty && !editor.busy && editor.save()}
      />
    </div>
  );
}
