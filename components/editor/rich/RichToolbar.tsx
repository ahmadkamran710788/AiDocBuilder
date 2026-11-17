'use client';

import type { Editor } from '@tiptap/core';
import { useEditorState } from '@tiptap/react';
import { useRef } from 'react';

type Props = { editor: Editor; onImages: (files: File[]) => void };

/** Formatting buttons for the visual editor. A second row appears while the cursor is in a table. */
export function RichToolbar({ editor, onImages }: Props) {
  const fileInput = useRef<HTMLInputElement>(null);
  const on = useEditorState({
    editor,
    selector: ({ editor: e }) => ({
      h2: e.isActive('heading', { level: 2 }),
      h3: e.isActive('heading', { level: 3 }),
      bold: e.isActive('bold'),
      italic: e.isActive('italic'),
      link: e.isActive('link'),
      step: e.isActive('step'),
      bullets: e.isActive('bulletList'),
      numbers: e.isActive('orderedList'),
      note: e.isActive('callout', { kind: 'note' }),
      warn: e.isActive('callout', { kind: 'warn' }),
      table: e.isActive('table'),
      canUndo: e.can().undo(),
      canRedo: e.can().redo(),
    }),
  });
  const run = () => editor.chain().focus();

  const setLink = () => {
    const current = (editor.getAttributes('link').href as string | undefined) ?? 'https://';
    const url = window.prompt('Link address (leave empty to remove the link)', current);
    if (url === null) return;
    if (!url.trim()) run().extendMarkRange('link').unsetLink().run();
    else run().extendMarkRange('link').setLink({ href: url.trim() }).run();
  };

  const Btn = ({ label, title, active, disabled, onClick, className }: { label: React.ReactNode; title: string; active?: boolean; disabled?: boolean; onClick: () => void; className?: string }) => (
    <button type="button" title={title} aria-pressed={active} disabled={disabled} className={`${active ? 'on' : ''} ${className ?? ''}`} onMouseDown={(e) => e.preventDefault()} onClick={onClick}>
      {label}
    </button>
  );

  return (
    <div className="ed-tools" role="toolbar" aria-label="Formatting">
      <span className="tool-group">
        <Btn label="↶" title="Undo (Ctrl/⌘ Z)" disabled={!on.canUndo} onClick={() => run().undo().run()} />
        <Btn label="↷" title="Redo" disabled={!on.canRedo} onClick={() => run().redo().run()} />
      </span>
      <span className="tool-group">
        <Btn label="Heading" title="Section heading" active={on.h2} onClick={() => run().toggleHeading({ level: 2 }).run()} />
        <Btn label="Subheading" title="Smaller heading" active={on.h3} onClick={() => run().toggleHeading({ level: 3 }).run()} />
      </span>
      <span className="tool-group">
        <Btn label={<b>B</b>} title="Bold (Ctrl/⌘ B)" active={on.bold} onClick={() => run().toggleBold().run()} />
        <Btn label={<i>I</i>} title="Italic (Ctrl/⌘ I)" active={on.italic} onClick={() => run().toggleItalic().run()} />
        <Btn label="Link" title="Add or change a link" active={on.link} onClick={setLink} />
      </span>
      <span className="tool-group">
        <Btn label="Step" title="Numbered step (numbers itself)" active={on.step} onClick={() => run().toggleStep().run()} />
        <Btn label="• List" title="Bullet list" active={on.bullets} onClick={() => run().toggleBulletList().run()} />
        <Btn label="1. List" title="Numbered list" active={on.numbers} onClick={() => run().toggleOrderedList().run()} />
      </span>
      <span className="tool-group">
        <Btn label="Note" title="Note box" active={on.note} onClick={() => run().toggleCallout('note').run()} />
        <Btn label="Warning" title="Warning box" active={on.warn} onClick={() => run().toggleCallout('warn').run()} />
      </span>
      <span className="tool-group">
        <Btn label="Table" title="Insert a table" disabled={on.table} onClick={() => run().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()} />
        <Btn label="＋ Picture" title="Upload a picture (you can also paste or drop one)" className="img-btn" onClick={() => fileInput.current?.click()} />
      </span>
      <input
        ref={fileInput}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={(e) => {
          const files = Array.from(e.target.files ?? []);
          e.target.value = '';
          onImages(files);
        }}
      />
      {on.table && (
        <div className="tool-row" aria-label="Table tools">
          <b>Table</b>
          <span className="tool-group">
            <Btn label="＋ Row" title="Add a row below" onClick={() => run().addRowAfter().run()} />
            <Btn label="＋ Column" title="Add a column to the right" onClick={() => run().addColumnAfter().run()} />
          </span>
          <span className="tool-group">
            <Btn label="− Row" title="Delete this row" onClick={() => run().deleteRow().run()} />
            <Btn label="− Column" title="Delete this column" onClick={() => run().deleteColumn().run()} />
          </span>
          <span className="tool-group">
            <Btn label="Header row" title="Turn the first row's heading style on or off" onClick={() => run().toggleHeaderRow().run()} />
            <Btn label="Delete table" title="Remove the whole table" className="danger" onClick={() => run().deleteTable().run()} />
          </span>
        </div>
      )}
    </div>
  );
}
