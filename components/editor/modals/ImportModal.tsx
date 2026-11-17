'use client';

import { useState } from 'react';
import type { Doc } from '@/lib/content';
import type { OnCreated } from '../types';
import { ModalActions } from './ModalActions';
import { TargetPicker } from './TargetPicker';
import { useImport } from './useImport';

type Props = { docs: Doc[]; defaultDoc?: string; onClose: () => void; onDone: OnCreated };
type Source = 'file' | 'paste';

const ACCEPT = '.docx,.md,.markdown,.txt,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/markdown,text/plain';
const PLACEHOLDER = '# Set up email notifications\n\nSend an email when a transaction succeeds or fails.\n\n## Steps\n\n**1.** Open the **Email Notifications** tab…';

/** Import pages from a Word file, a Markdown file, or pasted Markdown (for example from Claude). */
export function ImportModal({ docs, defaultDoc, onClose, onDone }: Props) {
  const imp = useImport(defaultDoc ?? docs[0]?.id ?? '__new', true, onDone);
  const [source, setSource] = useState<Source>('file');
  const [file, setFile] = useState<File | null>(null);
  const [md, setMd] = useState('');
  const [over, setOver] = useState(false);

  const pick = (f?: File | null) => {
    if (!f) return;
    if (!/\.(docx|md|markdown|txt)$/i.test(f.name)) {
      setFile(null);
      imp.setError('Choose a Word file (.docx) or a Markdown file (.md). Old .doc files must be saved as .docx first.');
      return;
    }
    imp.setError('');
    setFile(f);
  };
  const go = () => {
    const data = new FormData();
    if (source === 'file' && file) data.set('file', file);
    else data.set('markdown', md);
    void imp.send(data);
  };
  const isWord = !!file && /\.docx$/i.test(file.name);

  return (
    <>
      <h2>Import pages</h2>
      <div className="tabs" role="tablist">
        <button type="button" role="tab" aria-selected={source === 'file'} className={source === 'file' ? 'on' : ''} onClick={() => setSource('file')}>
          Upload a file
        </button>
        <button type="button" role="tab" aria-selected={source === 'paste'} className={source === 'paste' ? 'on' : ''} onClick={() => setSource('paste')}>
          Paste text
        </button>
      </div>
      {source === 'file' ? (
        <>
          <label
            className={`drop${over ? ' over' : ''}`}
            tabIndex={0}
            onDragOver={(e) => {
              e.preventDefault();
              setOver(true);
            }}
            onDragLeave={() => setOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setOver(false);
              pick(e.dataTransfer.files[0]);
            }}
          >
            <b>{file ? file.name : 'Choose a Word or Markdown file'}</b>
            <span>{file ? 'Click to choose another file' : '.docx or .md, or drop it here'}</span>
            <input type="file" hidden accept={ACCEPT} onChange={(e) => pick(e.target.files?.[0])} />
          </label>
          <p className="help">
            {isWord || !file
              ? 'Word files keep their headings, bold text, lists, tables, note boxes and screenshots. Screenshots are uploaded for you.'
              : 'Pictures inside a Markdown file are not uploaded. Add them afterwards by pasting them into the page.'}
          </p>
        </>
      ) : (
        <label className="fld">
          <span>Markdown, for example a page written by Claude</span>
          <textarea autoFocus value={md} onChange={(e) => setMd(e.target.value)} placeholder={PLACEHOLDER} />
        </label>
      )}
      <TargetPicker docs={docs} value={imp.target} onChange={imp.setTarget} newTitle={imp.newTitle} onNewTitle={imp.setNewTitle} />
      <label className="check">
        <input type="checkbox" checked={imp.split} onChange={(e) => imp.setSplit(e.target.checked)} /> Make a separate page for each main heading
        (Heading 1 in Word, “# ” in Markdown)
      </label>
      {imp.error && <div className="form-error">{imp.error}</div>}
      <p className="help">Imported pages arrive as drafts. Nothing goes live until it is reviewed and published.</p>
      <ModalActions onClose={onClose} onConfirm={go} confirmLabel="Import" busyLabel="Importing…" busy={imp.busy} disabled={source === 'file' ? !file : !md.trim()} />
    </>
  );
}
