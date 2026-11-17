'use client';

import { useState } from 'react';
import { toast } from '../../ui/Toaster';
import { api, errorMessage } from '../api';
import type { ImportResult, OnCreated } from '../types';

/** Shared by the Word and Markdown import modals: target documentation, split option, upload. */
export function useImport(defaultTarget: string, defaultSplit: boolean, onDone: OnCreated) {
  const [target, setTarget] = useState(defaultTarget);
  const [newTitle, setNewTitle] = useState('');
  const [split, setSplit] = useState(defaultSplit);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  /** `source` holds either a "file" (Word) or a "markdown" field. */
  const send = async (source: FormData) => {
    setBusy(true);
    setError('');
    try {
      source.set('doc', target);
      source.set('newDocTitle', newTitle);
      source.set('split', split ? '1' : '0');
      const r = await api<ImportResult>('/api/admin/import', { method: 'POST', body: source });
      await onDone(r.doc, r.pages[0].slug);
      const n = r.pages.length;
      const shots = r.images ? ` and ${r.images} screenshot${r.images === 1 ? '' : 's'}` : '';
      toast(`Imported ${n} page${n === 1 ? '' : 's'}${shots} as drafts. Check them, then submit for review.`);
    } catch (e) {
      setError(errorMessage(e, 'The import failed.'));
      setBusy(false);
    }
  };

  return { target, setTarget, newTitle, setNewTitle, split, setSplit, busy, error, setError, send };
}
