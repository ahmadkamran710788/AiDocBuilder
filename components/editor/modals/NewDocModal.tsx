'use client';

import { useState } from 'react';
import type { Doc } from '@/lib/content';
import { toast } from '../../ui/Toaster';
import { errorMessage, postJson } from '../api';
import type { OnCreated } from '../types';
import { ModalActions } from './ModalActions';

export function NewDocModal({ onClose, onDone }: { onClose: () => void; onDone: OnCreated }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const go = async () => {
    setBusy(true);
    try {
      const r = await postJson<{ doc: Doc; slug: string }>('/api/admin/docs', { title, description });
      await onDone(r.doc.id, r.slug);
      toast(`Created “${r.doc.title}”. Add pages, then publish them to show it on the site.`);
    } catch (e) {
      setError(errorMessage(e, 'The documentation could not be created.'));
      setBusy(false);
    }
  };
  return (
    <>
      <h2>New documentation</h2>
      <p className="help">A documentation is a separate guide with its own menu and its own link, for example “Exports &amp; Integrations”.</p>
      <label className="fld">
        <span>Name</span>
        <input autoFocus value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Exports & Integrations" maxLength={80} />
      </label>
      <label className="fld">
        <span>Short description</span>
        <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Export results and connect AIDocBuilder to other systems." maxLength={240} />
      </label>
      {error && <div className="form-error">{error}</div>}
      <ModalActions onClose={onClose} onConfirm={go} confirmLabel="Create" busyLabel="Creating…" busy={busy} disabled={!title.trim()} />
    </>
  );
}
