'use client';

import type { Editor } from '@tiptap/core';
import { Placeholder } from '@tiptap/extension-placeholder';
import { TableKit } from '@tiptap/extension-table';
import { EditorContent, useEditor as useTiptap } from '@tiptap/react';
import { StarterKit } from '@tiptap/starter-kit';
import { useEffect, useRef } from 'react';
import { toast } from '../../ui/Toaster';
import { api, errorMessage } from '../api';
import { Callout } from './extensions/Callout';
import { Figure } from './extensions/Figure';
import { Icon } from './extensions/Icon';
import { Step } from './extensions/Step';
import { prepareHtml } from './prepareHtml';
import { RichToolbar } from './RichToolbar';

type Props = {
  /** Changes whenever another page (or a fresh copy of this one) is opened. */
  contentKey: number;
  /** HTML to start from. */
  html: string;
  /** Documentation id: pictures are uploaded into its Cloudinary folder. */
  doc: string;
  docTitle: string;
  pageTitle: string;
  /** Called once the content is loaded, with the editor's own version of the HTML. */
  onReady: (html: string) => void;
  onChange: (html: string) => void;
  /** Number of pictures still uploading. */
  onUploading: (count: number) => void;
  onSave: () => void;
};

const imageFiles = (list: FileList | null | undefined) => Array.from(list ?? []).filter((f) => f.type.startsWith('image/'));

/** The visual page editor: what you see is what readers get. No Markdown, no tags. */
export function RichEditor({ contentKey, html, doc, docTitle, pageTitle, onReady, onChange, onUploading, onSave }: Props) {
  // Latest props for handlers created once with the editor.
  const live = useRef({ doc, onChange, onUploading, onSave, onReady });
  useEffect(() => {
    live.current = { doc, onChange, onUploading, onSave, onReady };
  });
  const pending = useRef(0);
  const editorRef = useRef<Editor | null>(null);

  /** Shows each picture at once (from the local file), uploads it to Cloudinary, then swaps in the real address. */
  const insertImages = (files: File[], at?: number) => {
    const editor = editorRef.current;
    if (!editor) return;
    for (const file of files.filter((f) => f.type.startsWith('image/'))) {
      const uploadId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const preview = URL.createObjectURL(file);
      const node = { type: 'figure', attrs: { src: preview, alt: 'Screenshot', uploadId } };
      // A picture goes after the paragraph the cursor (or the drop) is in, so it never cuts a sentence in two.
      const $pos = typeof at === 'number' ? editor.state.doc.resolve(at) : editor.state.selection.$from;
      if ($pos.depth > 0 && $pos.parent.isTextblock && $pos.parent.content.size > 0) editor.chain().focus().insertContentAt($pos.after(), node).run();
      else if (typeof at === 'number') editor.chain().focus().insertContentAt(at, node).run();
      else editor.chain().focus().insertContent(node).run();
      live.current.onUploading(++pending.current);

      const finish = (url: string | null) => {
        const { state, view } = editor;
        state.doc.descendants((n, pos) => {
          if (n.type.name !== 'figure' || n.attrs.uploadId !== uploadId) return true;
          view.dispatch(url ? state.tr.setNodeMarkup(pos, undefined, { ...n.attrs, src: url, uploadId: null }) : state.tr.delete(pos, pos + n.nodeSize));
          return false;
        });
        URL.revokeObjectURL(preview);
        live.current.onUploading(--pending.current);
      };

      const data = new FormData();
      data.set('file', file);
      data.set('doc', live.current.doc);
      api<{ url: string }>('/api/admin/upload', { method: 'POST', body: data })
        .then(({ url }) => finish(url))
        .catch((e) => {
          finish(null);
          toast(errorMessage(e, 'The picture could not be uploaded.'));
        });
    }
  };

  const editor = useTiptap({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3, 4] }, link: { openOnClick: false, autolink: true } }),
      TableKit.configure({ table: { resizable: false } }),
      Placeholder.configure({ placeholder: 'Write the page here. Paste or drop a screenshot to add a picture.' }),
      Step,
      Callout,
      Icon,
      Figure,
    ],
    editorProps: {
      attributes: { class: 'page rich-body', 'aria-label': 'Page content', spellcheck: 'true' },
      handlePaste: (_view, event) => {
        const files = imageFiles(event.clipboardData?.files);
        if (!files.length) return false;
        event.preventDefault();
        insertImages(files);
        return true;
      },
      handleDrop: (view, event, _slice, moved) => {
        const files = imageFiles(event.dataTransfer?.files);
        if (moved || !files.length) return false;
        event.preventDefault();
        insertImages(files, view.posAtCoords({ left: event.clientX, top: event.clientY })?.pos);
        return true;
      },
      handleKeyDown: (_view, event) => {
        if ((event.metaKey || event.ctrlKey) && !event.altKey && event.key.toLowerCase() === 's') {
          event.preventDefault();
          live.current.onSave();
          return true;
        }
        return false;
      },
    },
    onUpdate: ({ editor: e }) => live.current.onChange(e.getHTML()),
  });

  useEffect(() => {
    editorRef.current = editor;
  }, [editor]);

  // Load a page: its HTML becomes the document, and the editor's own serialisation the baseline for "unsaved".
  useEffect(() => {
    if (!editor) return;
    editor.commands.setContent(prepareHtml(html), { emitUpdate: false });
    editor.commands.setTextSelection(0);
    live.current.onReady(editor.getHTML());
    // `html` is read only when a page is opened; later changes come from the editor itself.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor, contentKey]);

  if (!editor) return <div className="rich-loading">Loading the editor…</div>;
  return (
    <>
      <RichToolbar editor={editor} onImages={(files) => insertImages(files)} />
      <div className="rich">
        <div className="rich-page">
          <p className="eyebrow">{docTitle}</p>
          <h1 className="rich-title">{pageTitle || 'Untitled page'}</h1>
          <EditorContent editor={editor} />
        </div>
      </div>
    </>
  );
}
