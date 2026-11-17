'use client';

import type { User } from '@/lib/auth';
import { Modal } from '../ui/Modal';
import { EditorTopBar } from './EditorTopBar';
import { ImportModal } from './modals/ImportModal';
import { NewDocModal } from './modals/NewDocModal';
import { SettingsModal } from './modals/SettingsModal';
import { UsersModal } from './modals/UsersModal';
import { PageEditor } from './PageEditor';
import { PagesPanel } from './PagesPanel';
import { useEditor } from './useEditor';

/** The editor panel at /admin. State lives in useEditor; the parts below render it. */
export function Editor({ user }: { user: User }) {
  const editor = useEditor();
  const { state, cur, modal, setModal, docFilter } = editor;
  const close = () => setModal(null);

  return (
    <>
      <EditorTopBar user={user} dirty={editor.dirty} onSettings={() => setModal('settings')} onUsers={() => setModal('users')} />
      <section className="editor">
        {editor.loadError && <div className="empty-doc">{editor.loadError}</div>}
        <div className="ed-grid">
          <PagesPanel editor={editor} isReviewer={user.role === 'reviewer'} />
          <PageEditor editor={editor} isReviewer={user.role === 'reviewer'} />
        </div>
      </section>

      {modal && state && (
        <Modal onClose={close}>
          {modal === 'import' && <ImportModal docs={state.docs} defaultDoc={docFilter || cur?.doc} onClose={close} onDone={editor.afterCreate} />}
          {modal === 'doc' && <NewDocModal onClose={close} onDone={editor.afterCreate} />}
          {modal === 'users' && <UsersModal me={user} onClose={close} />}
          {modal === 'settings' && <SettingsModal settings={state.settings} onClose={close} onSaved={editor.refresh} />}
        </Modal>
      )}
    </>
  );
}
