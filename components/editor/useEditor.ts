'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Status } from '@/lib/content';
import { toast } from '../ui/Toaster';
import { api, ApiError, errorMessage, postJson } from './api';
import { NEW_PAGE_TEMPLATE } from './constants';
import type { EditorState, LoadedPage, ModalKind, PageForm, StatusFilter } from './types';

const EMPTY_FORM: PageForm = { title: '', description: '', body: '' };

/** All state and actions of the editor panel. The components under ./ only render it. */
export function useEditor() {
  const [state, setState] = useState<EditorState | null>(null);
  const [cur, setCur] = useState<LoadedPage | null>(null);
  const [form, setForm] = useState<PageForm>(EMPTY_FORM);
  /** Goes up each time a page is (re)opened, so the visual editor loads its content. */
  const [contentKey, setContentKey] = useState(0);
  const [filter, setFilter] = useState<StatusFilter>('all');
  const [docFilter, setDocFilter] = useState('');
  const [modal, setModal] = useState<ModalKind>(null);
  const [working, setWorking] = useState(false);
  const [uploading, setUploadingCount] = useState(0);
  const [loadError, setLoadError] = useState('');

  const dirty = !!cur && (form.title !== cur.title || form.description !== cur.description || form.body !== cur.body);
  /** True while an action runs or a picture uploads: saving then would store a half-finished page. */
  const busy = working || uploading > 0;

  // Latest values, for callbacks that must not close over stale state.
  const latest = useRef({ cur, form, dirty });
  useEffect(() => {
    latest.current = { cur, form, dirty };
  });

  const refresh = useCallback(async () => {
    const s = await api<EditorState>('/api/admin/state');
    setState(s);
    return s;
  }, []);

  const open = useCallback(async (doc: string, slug: string) => {
    const { page } = await api<{ page: LoadedPage }>(`/api/admin/page?doc=${doc}&slug=${slug}`);
    setCur(page);
    setForm({ title: page.title, description: page.description, body: page.body });
    setContentKey((k) => k + 1);
  }, []);

  /** Runs an action, shows its error as a toast, and blocks double clicks meanwhile. */
  const run = useCallback(async (fn: () => Promise<void>) => {
    setWorking(true);
    try {
      await fn();
    } catch (e) {
      toast(e instanceof ApiError ? e.message : 'Something went wrong.');
    } finally {
      setWorking(false);
    }
  }, []);

  const saveCurrent = useCallback(async () => {
    const { cur: c, form: f } = latest.current;
    if (c) await postJson('/api/admin/page', { action: 'save', doc: c.doc, slug: c.slug, ...f, format: 'html' });
  }, []);

  // First load: open the page waiting for review, or the first page.
  useEffect(() => {
    (async () => {
      try {
        const s = await refresh();
        const first = s.pages.find((p) => p.status === 'review') ?? s.pages[0];
        if (first) await open(first.doc, first.slug);
      } catch (e) {
        setLoadError(errorMessage(e, 'The editor could not load.'));
      }
    })();
  }, [open, refresh]);

  // Warn before closing the tab with unsaved text.
  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => {
      if (latest.current.dirty) e.preventDefault();
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, []);

  const docTitle = useCallback((id: string) => state?.docs.find((d) => d.id === id)?.title ?? id, [state]);

  const rows = useMemo(
    () => (state?.pages ?? []).filter((p) => (filter === 'all' || p.status === filter) && (!docFilter || p.doc === docFilter)),
    [state, filter, docFilter],
  );

  /* ---------- the visual editor reports back ---------- */

  /** The editor has loaded a page: its own version of the HTML is what "unchanged" means. */
  const setBaseline = useCallback((html: string) => {
    setCur((c) => (c ? { ...c, body: html } : c));
    setForm((f) => ({ ...f, body: html }));
  }, []);
  const setBody = useCallback((html: string) => setForm((f) => ({ ...f, body: html })), []);
  const setUploading = useCallback((count: number) => setUploadingCount(Math.max(0, count)), []);

  /* ---------- page actions ---------- */

  /** Switches page. Unsaved edits on the current page are kept as a draft first. */
  const select = (doc: string, slug: string) =>
    run(async () => {
      if (latest.current.dirty) await saveCurrent();
      await open(doc, slug);
      await refresh();
    });

  /**
   * Workflow actions that keep the page open. The text in the editor stays as
   * it is (cursor and undo history included); only the page's status changes.
   */
  const act = (action: string, done: string, next: { status: Status; hasLive?: boolean }, withContent = false) =>
    run(async () => {
      if (!cur) return;
      const sent = form;
      await postJson('/api/admin/page', { action, doc: cur.doc, slug: cur.slug, ...(withContent ? { ...sent, format: 'html' } : {}) });
      setCur((c) => (c ? { ...c, ...(withContent ? sent : {}), status: next.status, hasLive: next.hasLive ?? c.hasLive } : c));
      await refresh();
      if (action === 'publish') toast(done, `/${cur.doc}/${cur.slug}`, 'View live page');
      else toast(done);
    });

  const save = () => act('save', 'Draft saved. Only editors can see it.', { status: 'draft' }, true);
  const submit = () => act('submit', 'Sent for review. A reviewer can now approve and publish it.', { status: 'review' }, true);
  const requestChanges = () => act('request-changes', 'Moved back to Draft.', { status: 'draft' });
  const publish = () => act('publish', `Published. “${form.title}” is live in ${docTitle(cur?.doc ?? '')}.`, { status: 'published', hasLive: true });

  const discard = () => {
    if (!cur) return;
    const msg = cur.hasLive
      ? 'Discard this draft? The live page stays as it is.'
      : 'Discard this draft? The page was never published, so it will be deleted.';
    if (!window.confirm(msg)) return;
    void run(async () => {
      await postJson('/api/admin/page', { action: 'discard', doc: cur.doc, slug: cur.slug });
      const s = await refresh();
      const next = cur.hasLive ? cur : s.pages.find((p) => p.doc === cur.doc) ?? s.pages[0];
      if (next) await open(next.doc, next.slug);
      else setCur(null);
      toast('Draft discarded.');
    });
  };

  const unpublish = () => {
    if (!cur || !window.confirm(`Take “${cur.title}” off the public site? Its text is kept as a draft.`)) return;
    void act('unpublish', 'Unpublished. The page is now a draft.', { status: 'draft', hasLive: false });
  };

  const newPage = () =>
    run(async () => {
      if (!state?.docs.length) {
        setModal('doc');
        return;
      }
      if (dirty) await saveCurrent();
      const doc = docFilter || cur?.doc || state.docs[0].id;
      const { slug } = await postJson<{ slug: string }>('/api/admin/page', { action: 'create', doc, title: 'Untitled page', description: '', body: NEW_PAGE_TEMPLATE });
      setFilter('all');
      await open(doc, slug);
      await refresh();
      const el = document.getElementById('edTitle') as HTMLInputElement | null;
      el?.focus();
      el?.select();
    });

  /** After an import or a new documentation: show its pages and open the first. */
  const afterCreate = async (doc: string, slug: string) => {
    setModal(null);
    setDocFilter(doc);
    setFilter('all');
    await refresh();
    await open(doc, slug);
  };

  /** Deletes a whole documentation and its pages, after a clear warning. */
  const deleteDoc = (id: string) => {
    const pages = (state?.pages ?? []).filter((p) => p.doc === id);
    const live = pages.filter((p) => p.hasLive).length;
    const what = pages.length
      ? `its ${pages.length} page${pages.length === 1 ? '' : 's'}${live ? ` (${live} live on the public site)` : ''}`
      : 'it (it has no pages)';
    if (!window.confirm(`Delete the documentation “${docTitle(id)}” and ${what}? This cannot be undone.`)) return;
    void run(async () => {
      await api('/api/admin/docs', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
      setDocFilter('');
      const s = await refresh();
      if (cur?.doc === id) {
        const next = s.pages[0];
        if (next) await open(next.doc, next.slug);
        else setCur(null);
      }
      toast('Documentation deleted.');
    });
  };

  /** Moves the open page up or down in its documentation's menu. */
  const move = (direction: 'up' | 'down') =>
    run(async () => {
      if (!cur) return;
      await postJson('/api/admin/page', { action: `move-${direction}`, doc: cur.doc, slug: cur.slug });
      await refresh();
    });

  return {
    state, cur, form, setForm, dirty, busy, uploading, loadError, contentKey,
    filter, setFilter, docFilter, setDocFilter, rows, docTitle,
    modal, setModal,
    select, save, submit, requestChanges, publish, discard, unpublish, newPage, afterCreate, refresh, move, deleteDoc,
    setBaseline, setBody, setUploading,
  };
}

export type EditorController = ReturnType<typeof useEditor>;
